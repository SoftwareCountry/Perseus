import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewChecked, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import 'codemirror/addon/edit/continuelist';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';
import * as CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/sql/sql';
import { cloneDeep } from '@app/infrastructure/utility';
import { ITable, Table } from '@models/table';
import { CommonUtilsService } from '@services/common-utils.service';
import { BridgeService } from '@services/bridge.service';
import { StoreService } from '@services/store.service';
import { PerseusApiService } from '@services/perseus/perseus-api.service'
import {
  createTable,
  getTableAliasesInfo,
  JOIN_MAPPING,
  mapToPostgresSqlName,
  onKeyUp,
  SELECT_MAPPING,
  selectTemplate
} from '@shared/sql-editor/sql-editor'
import { AliasTableMapping, SqlEditorData, TablesColumnsMapping } from '@shared/sql-editor/sql-editor.data'
import { BaseComponent } from '@shared/base/base.component'
import { takeUntil } from 'rxjs/operators'
import { openHttpErrorDialog } from '@utils/error'

const editorSettings = {
  mode: 'text/x-sql',
  lineNumbers: false,
  indentWithTabs: true,
  smartIndent: true,
  matchBrackets: true,
  autofocus: true,
  extraKeys: { 'Ctrl-Space': 'autocomplete' },
  hint: CodeMirror.hint.sql,
};

@Component({
  selector: 'sql-editor',
  styleUrls: [ './sql-editor.component.scss' ],
  templateUrl: './sql-editor.component.html'
})
export class SqlEditorComponent extends BaseComponent implements OnInit, AfterViewChecked {
  constructor(
    private commonUtilsService: CommonUtilsService,
    private dialogRef: MatDialogRef<SqlEditorComponent>,
    private cdRef: ChangeDetectorRef,
    private bridgeService: BridgeService,
    private matDialog: MatDialog,
    private storeService: StoreService,
    private perseusApiService: PerseusApiService,
    @Inject(MAT_DIALOG_DATA) public data: SqlEditorData
  ) {
    super();
  }

  @ViewChild('editor', { static: true })
  editor;
  codeMirror: CodeMirror;

  tables: ITable[];
  table: ITable;

  nameControl = new FormControl('', Validators.compose(
    [ Validators.maxLength(50), Validators.required ]
  ));

  chips = [];

  tableColumnsMapping: TablesColumnsMapping = {};

  tokenReplaceMapping = {
    join: JOIN_MAPPING,
    JOIN: JOIN_MAPPING,
    select: SELECT_MAPPING,
    SELECT: SELECT_MAPPING,
    '*': (context) => {
      const {tablesWithoutAlias, aliasTableMapping} = getTableAliasesInfo(this.editorContent)
      const columnsWithoutAlias = tablesWithoutAlias
        .reduce((prev, cur) => [...prev, ...this.tableColumnsMapping[cur]], []);
      return [...this.aliasedTablesColumns(aliasTableMapping, true), ...columnsWithoutAlias];
    }
  };

  viewNameExist = false;
  editorEmpty = true;

  ngOnInit() {
    this.chips = this.data.tables.filter(it => !it.sql);
    this.tables = cloneDeep(this.data.tables);
    this.table = { ...this.data.table };
    this.initCodeMirror();
    if (this.data.action === 'Edit') {
      const { name, sql } = this.table;
      this.nameControl.setValue(name);
      this.codeMirror.setValue(sql);
      this.editorEmpty = !sql;
    }
    this.subscribeOnNameChange();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  initCodeMirror() {
    const tableColumnNamesMapping = {}; // This object used for autocomplete column names
    this.tableColumnsMapping = this.tables.reduce((mapping, table) => {
      mapping[table.name] = table.rows;
      tableColumnNamesMapping[table.name] = table.rows.map(mapToPostgresSqlName);
      return mapping;
    }, {});

    this.codeMirror = CodeMirror.fromTextArea(this.editor.nativeElement, {
      ...editorSettings,
      hintOptions: { tables: tableColumnNamesMapping }
    });
    this.codeMirror.on('cursorActivity', this.onCursorActivity.bind(this));
    this.codeMirror.on('keyup', onKeyUp.bind(this));
    this.codeMirror.on('change', this.onChange.bind(this));
  }

  get editorContent() {
    return this.codeMirror ? this.codeMirror.getValue() : '';
  }

  get name() {
    return this.nameControl.value;
  }

  /**
   * Generate SQL code when user drag dn drop chip on text area
   */
  drop(event: CdkDragDrop<any>) {
    const text = event.item.element.nativeElement.textContent.trim();
    this.codeMirror.setValue(this.editorContent ? this.joinTemplate(text) : selectTemplate(text));
  }

  openOnBoardingTip(target: EventTarget) {
    this.commonUtilsService.openOnBoardingTip(target, 'sql-editor');
  }

  apply() {
    let viewSql: string = this.editorContent.replace(/^(\r\n)|(\n)/gi, ' ').replace(/\s\s+/g, ' ');
    viewSql = this.handleSelectAllCases(viewSql);

    this.perseusApiService.getView({ sql: viewSql }).subscribe(res => {
      const viewTableId = this.getExistedOrGenerateNewTableId()
      const newTable = createTable(viewTableId, this.name, viewSql, res);
      this.removeLinksForDeletedRows(newTable);
      this.dialogRef.close(newTable);
    },
      error => openHttpErrorDialog(this.matDialog, 'View SQL error', error));
  }

  /**
   * Legacy
   * Prepare sql function before sending to back-end
   * Replace * (SELECT ALL) to field list if SQL query contains JOIN operator
   * This functional need to display column with same name but from different tables in Mapping Fields Page
   * @return if JOIN query and same columns - parsed sql function with replaced * on fields list, else - content param
   */
  private handleSelectAllCases(viewSql: string): string {
    const {aliasTableMapping} = getTableAliasesInfo(this.editorContent)
    if (this.editorContent.match(/select \*/gi)) {
      const columns = [];
      Object.keys(aliasTableMapping).forEach(item => {
        this.createColumnAliases(aliasTableMapping, item, columns);
      });
      const allColumns = columns.join(',')
      viewSql = viewSql.replace(/select \*/gi, `select ${allColumns}`)
    } else {
      const totalColumns = [];
      Object.keys(aliasTableMapping).forEach(item => {
        const columns = [];
        const matchPattern = `${item}\\.\\*`
        const re = new RegExp(matchPattern, 'gi');
        if (this.editorContent.match(re)) {
          this.createColumnAliases(aliasTableMapping, item, columns, totalColumns);
          const allColumns = columns.join(',')
          viewSql = viewSql.replace(re, allColumns)
        }
      })
    }
    return viewSql;
  }

  private createColumnAliases(aliasTableMapping: AliasTableMapping,
                              tableAlias: string,
                              columns: any,
                              totalColumns?: any) {
    const tableName = aliasTableMapping[tableAlias];
    const table = this.storeService.state.source.find(it => it.name === tableName);
    let duplicateColumns;
    table.rows.forEach(row => {
      duplicateColumns = totalColumns ? totalColumns : columns
      const columnName = !duplicateColumns.find(col => col.substring(col.indexOf('.') + 1) === row.name) ?
      `${tableAlias}.${row.name}` :
      `${tableAlias}.${row.name} AS ${row.name}_${tableName}`;
      if (totalColumns) {
        totalColumns.push(columnName)
      }
      columns.push(columnName)
    })
  }

  private removeLinksForDeletedRows(newTable: Table) {
    Object.keys(this.bridgeService.arrowsCache).forEach(key => {
      const arrowSourceTableId = Number(key.substr(0, key.indexOf('-')));
      if (arrowSourceTableId === newTable.id) {
        const arrowSourceRowId = Number(key.substring(key.indexOf('-') + 1, key.indexOf('/')));
        if (newTable.rows[ arrowSourceRowId ].name !== this.bridgeService.arrowsCache[ key ].source.name) {
          this.bridgeService.deleteArrow(key, true);
        }
      }
    });
  }

  private aliasedTablesColumns(aliasTableMapping: AliasTableMapping, prefix = false) {
    return Object.keys(aliasTableMapping).reduce((prev, cur) => {
      const tableName = aliasTableMapping[cur];
      const columns = this.tableColumnsMapping[tableName];
      const tableColumns = prefix ? columns.map(it => `${cur}.${it.name}`) : columns;
      return [ ...prev, ...tableColumns ];
    }, []);
  }

  private joinTemplate(text) {
    const joinCount = (this.editorContent.match(/join/gi) || []).length;
    return `${this.editorContent}
      join ${text} as t${joinCount + 2} on`;
  }

  private onChange(cm, event) {
    this.nameControl.markAsTouched();
    const editorContent = this.editorContent
    this.editorEmpty = !editorContent
  }

  /**
   * Show hint: token autocomplete by this.tokenReplaceMapping
   */
  private onCursorActivity(cm, event) {
    this.nameControl.markAsTouched();
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const hasReplaceHints = !!this.tokenReplaceMapping[ token.string ];
    if (hasReplaceHints) {
      const getList = this.tokenReplaceMapping[ token.string ];
      const hintOptions = {
        completeSingle: false,
        hint: () => ({
          from: {line: cursor.line, ch: token.start },
          to: {line: cursor.line, ch: token.end },
          list: getList(token)
        })
      };
      cm.showHint(hintOptions);
    }
  }

  private subscribeOnNameChange() {
    if (this.data.action === 'Create') {
      const tableNamesInUpperCase = this.tables.map(table => table.name.toUpperCase())
      this.nameControl.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(value => {
          this.viewNameExist = tableNamesInUpperCase.includes(value.toUpperCase())
        })
    }
  }

  private getExistedOrGenerateNewTableId(): number {
    return this.data.action === 'Create' ?
      (this.tables.reduce((a, b) => a.id > b.id ? a : b).id) + 1
      : this.table.id;
  }
}
