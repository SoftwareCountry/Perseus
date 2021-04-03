import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep, uniq } from 'src/app/infrastructure/utility';
import { MappingPageSessionStorage } from 'src/app/models/implementation/mapping-page-session-storage';
import { ITable } from 'src/app/models/table';
import { IRow } from 'src/app/models/row';
import { BridgeService } from 'src/app/services/bridge.service';
import { CommonService } from 'src/app/services/common.service';
import { DataService } from 'src/app/services/data.service';
import { StateService } from 'src/app/services/state.service';
import { StoreService } from 'src/app/services/store.service';
import { PanelComponent } from '../panel/panel.component';
import { PreviewPopupComponent } from '../popups/preview-popup/preview-popup.component';
import { RulesPopupService } from '../popups/rules-popup/services/rules-popup.service';
import { OverlayConfigOptions } from 'src/app/services/overlay/overlay-config-options.interface';
import { OverlayService } from 'src/app/services/overlay/overlay.service';
import { SetConnectionTypePopupComponent } from '../popups/set-connection-type-popup/set-connection-type-popup.component';
import { DeleteWarningComponent } from '../popups/delete-warning/delete-warning.component';
import { CdmFilterComponent } from '../popups/open-cdm-filter/cdm-filter.component';
import { TransformConfigComponent } from '../vocabulary-transform-configurator/transform-config.component';
import { Area } from 'src/app/models/area';
import * as groups from './groups-conf.json';
import { ActivatedRoute, Router } from '@angular/router';
import { addGroupMappings, addViewsToMapping } from '../../models/mapping-service';
import {
  numberOfPanelsWithOneSimilar,
  numberOfPanelsWithoutSimilar,
  numberOfPanelsWithTwoSimilar,
  similarTableName
} from '../../app.constants';
import { SelectTableDropdownComponent } from '../popups/select-table-dropdown/select-table-dropdown.component';
import { FakeDataDialogComponent } from '../../scan-data/fake-data-dialog/fake-data-dialog.component';
import { CdmDialogComponent } from '../../scan-data/cdm-dialog/cdm-dialog.component';
import { LookupService } from '../../services/lookup.service';
import { getLookupType } from '../../services/utilites/lookup-util';
import * as conceptFields from '../concept-fileds-list.json';
import { ConceptTransformationComponent } from '../concept-transformation/concept-transformation.component';
import { BaseComponent } from '../../base/base.component';
import { VocabularyObserverService } from '../../services/vocabulary-observer.service';
import { ReportGenerationEvent, ReportGenerationService, ReportType } from '../../services/report-generation.service';

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss']
})
export class MappingComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  source: ITable[];
  target: ITable[];
  sourceTablesWithoutSimilar: ITable[];
  selectedSourceTable: ITable;
  selectedTargetTable: ITable;

  sourceTabIndex = 0;
  targetTabIndex = 0;

  clickArrowSubscriptions = [];
  panelsViewInitialized = new Set();

  sourceRows: IRow[] = [];
  targetRows: IRow[] = [];

  mappingConfig = [];

  similarTableName = similarTableName;
  filteredFields;

  lookup;

  numberOfPanels: number;

  hasScanReport = false;

  conceptFieldNames = (conceptFields as any).default;

  isVocabularyVisible = false;

  mainHeight = '';

  get hint(): string {
    return 'no hint';
  }

  get state() {
    return this.stateService.state;
  }

  get currentTargetTable() {
    return this.targetTabIndex === 0 && this.similarTargetTable ? this.similarTargetTable : this.selectedTargetTable;
  }

  get currentSourceTable() {
    return this.sourceTabIndex === 0 && this.similarSourceTable ? this.similarSourceTable : this.selectedSourceTable;
  }

  get similarSourceTable() {
    return this.source.find(item => item.name === 'similar');
  }

  get similarTargetTable() {
    return this.target.find(item => item.name === 'similar');
  }

  @ViewChild('arrowsarea', {read: ElementRef, static: true}) svgCanvas: ElementRef;
  @ViewChild('maincanvas', {read: ElementRef, static: true}) mainCanvas: ElementRef;
  @ViewChild('sourcePanel') sourcePanel: PanelComponent;
  @ViewChild('targetPanel') targetPanel: PanelComponent;
  @ViewChild('sourcePanelSimilar') sourcePanelSimilar: PanelComponent;
  @ViewChild('targetPanelSimilar') targetPanelSimilar: PanelComponent;

  constructor(
    private stateService: StateService,
    private storeService: StoreService,
    private dataService: DataService,
    private commonService: CommonService,
    private bridgeService: BridgeService,
    private matDialog: MatDialog,
    private rulesPoupService: RulesPopupService,
    mappingElementRef: ElementRef,
    private mappingStorage: MappingPageSessionStorage,
    private overlayService: OverlayService,
    private router: Router,
    private lookupService: LookupService,
    private activatedRoute: ActivatedRoute,
    private vocabularyObserverService: VocabularyObserverService,
    private reportGenerationService: ReportGenerationService
  ) {
    super();
    this.commonService.mappingElement = mappingElementRef;
  }

  ngOnInit() {
    if (this.storeService.state.target.length === 0) {
      this.router.navigateByUrl(`/comfy`);
      return;
    }

    this.loadMapping();

    this.initHasScanReport();

    this.setMainHeight();

    this.subscribeOnVocabularyOpening()

    this.subscribeOnPrepareReportGenerationConfig()

    this.storeService.add('isMappingPage', true)
  }

  ngAfterViewInit() {
    this.svgCanvas.nativeElement.addEventListener('mouseup', (event: any) => {
      const markerWidth = 16;
      const { offsetX, offsetY, currentTarget } = event;

      if (offsetX < markerWidth) {
        event.stopPropagation();
        this.startMarkerClick(offsetY, currentTarget);
      } else if (offsetX > currentTarget.clientWidth - markerWidth) {
        event.stopPropagation();
        this.endMarkerClick(offsetY, currentTarget);
      }
    });
  }

  ngOnDestroy() {
    this.clickArrowSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });

    this.saveMappingStatus();

    this.storeService.add('isMappingPage', false)

    super.ngOnDestroy();
  }

  startMarkerClick(offset: number, currentTarget: any) {
    let i = currentTarget.children.length - 1;
    while (i >= 0) {
      const child = currentTarget.children[ i ];
      i--;
      if (child.localName !== 'path') {
        continue;
      }

      const startXYAttributeIndex = 6;
      const { upperLimit, lowerLimit } = this.getLimits(child.attributes[ startXYAttributeIndex ].value);
      if (offset >= upperLimit && offset <= lowerLimit) {
        this.bridgeService.deleteArrow(child.id);
      }
    }
  }

  endMarkerClick(offset: number, currentTarget: any) {
    for (const child of currentTarget.children) {
      if (child.localName !== 'path') {
        continue;
      }

      const arrow = this.bridgeService.arrowsCache[ child.id ];

      const endXYAttributeIndex = 7;
      const { upperLimit, lowerLimit } = this.getLimits(child.attributes[ endXYAttributeIndex ].value);
      if (offset >= upperLimit && offset <= lowerLimit) {

        const dialogOptions: OverlayConfigOptions = {
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          positionStrategyFor: 'values',
          payload: {
            arrow
          }
        };

        const htmlElementId = arrow.target.name.startsWith('cdm~') ? arrow.target.name : `cdm~${arrow.target.name}`;
        const htmlElement = document.getElementById(htmlElementId);
        if (!(this.conceptFieldNames[arrow.target.tableName] && this.conceptFieldNames[arrow.target.tableName].includes(arrow.target.name))) {

          const dialogRef = this.overlayService.open(dialogOptions, htmlElement, SetConnectionTypePopupComponent);
          dialogRef.afterClosed$.subscribe((configOptions: any) => {
            const {connectionType} = configOptions;
            if (connectionType) {
              const selectedtab = connectionType === 'L' ? 'Lookup' : 'SQL Function';
              const lookupType = getLookupType(arrow);
              const transformDialogRef = this.matDialog.open(TransformConfigComponent, {
                closeOnNavigation: false,
                disableClose: false,
                panelClass: 'sql-editor-dialog-padding-15',
                maxHeight: '100%',
                width: '570px;',
                data: {
                  arrowCache: this.bridgeService.arrowsCache,
                  connector: arrow.connector,
                  lookupName: arrow.lookup ? arrow.lookup['name'] : '',
                  lookupType,
                  sql: arrow.sql,
                  tab: selectedtab
                }
              });

              transformDialogRef.afterClosed().subscribe((options: any) => {
                if (options) {
                  const {lookup, sql} = options;
                  if (lookup) {
                    if (lookup['originName']) {
                      this.lookup = lookup;
                      this.lookup['applied'] = true;
                      const lookupName = this.lookup['name'] ? this.lookup['name'] : this.lookup['originName'];
                      this.bridgeService.arrowsCache[child.id].lookup = {name: lookupName, applied: true};
                    }

                    if (lookup['originName'] && lookup['name'] && lookup['originName'] !== lookup['name']) {
                      this.lookupService.saveLookup(this.lookup, lookupType).subscribe(res => {
                        console.log(res);
                      });
                    }
                  }
                  if (sql) {
                    if (sql['name'] || sql['name'] === '') {
                      arrow.sql = sql;
                      arrow.sql['applied'] = sql['name'] !== '';
                    }
                  }
                  this.bridgeService.updateConnectedRows(arrow);
                }
              });
            }
          });
        } else {
          const transformDialogRef = this.matDialog.open(ConceptTransformationComponent, {
            closeOnNavigation: false,
            disableClose: true,
            panelClass: 'sql-editor-dialog-padding-15-width-650',
            maxHeight: '100%',
            data: {
              arrowCache: this.bridgeService.arrowsCache,
              row: arrow.target,
              oppositeSourceTable: this.targetPanel.oppositeTableName ? this.targetPanel.oppositeTableName : 'similar'
            }
          });
        }
        return;
      }
    }
  }

  getLimits(value: string) {
    const offset = 8;
    const point = parseInt(value.split(',')[ 1 ], 0);
    const upperLimit = point - offset;
    const lowerLimit = point + offset;
    return { upperLimit, lowerLimit };
  }

  prepareTables(data, area) {
    const rowsKey = `${area}Rows`;
    this[ area ] = this.bridgeService.prepareTables(data, area, this[ rowsKey ]);
  }

  prepareMappedTables(mappingConfig) {
    this.mappingConfig = mappingConfig;

    this.addSimilar(Area.Source);
    this.addSimilar(Area.Target);
  }

  addSimilar(area) {
    const lastIndex = this[ area ].length - 1;
    const lastTableName = this[ area ][ lastIndex ].name;
    if (lastTableName === this.similarTableName) {
      this[ `${area}Similar` ](this[ area ][ lastIndex ].rows);
    }
  }

  sourceSimilar(rows) {
    rows.forEach(row => {
      this.sourceRows.forEach(sourceRow => {
        if (sourceRow.name !== row.name) {
          return;
        }

        this.mappingConfig.forEach(item => {
          if (item.includes(sourceRow.tableName) && !item.includes(this.similarTableName)) {
            item.push(this.similarTableName);
          }
        });
      });
    });
  }

  targetSimilar(rows) {
    const newItem = [];
    rows.forEach(row => {
      this.targetRows.forEach(targetRow => {
        if (targetRow.name !== row.name) {
          return;
        }

        this.mappingConfig.forEach(item => {
          if (!item.includes(targetRow.tableName)) {
            return;
          }

          if (!newItem.length) {
            newItem.push(this.similarTableName);
          }

          newItem.push.apply(newItem, item.slice(1));
        });
      });
    });
    this.mappingConfig.push(uniq(newItem));
  }

  moveSimilarTables() {
    this.moveSimilar(Area.Source);
    this.moveSimilar(Area.Target);
  }

  moveSimilar(area) {
    if (this[ area ][ this[ area ].length - 1 ].name === this.similarTableName) {
      this[ area ].unshift(this[ area ].pop());
    }
  }

  getMappingConfig() {
    const mappingConfig = [];
    Object.keys(this.storeService.state.targetConfig).forEach(key => {
      const item = this.storeService.state.targetConfig[ key ].data;
      if (item.length > 1) {
        mappingConfig.push(cloneDeep(item));
      }
    });
    return mappingConfig;
  }

  getEnabledTargetTables() {
    const isEnabledTargetTable = this.sourceTabIndex === 0 && this.similarSourceTable ?
      (table) => this.mappingConfig.find(item => item.includes(table.name) && table.name !== 'similar') :
      (table) => this.mappingConfig.find(item => item.includes(table.name) && item.includes(this.selectedSourceTable.name) && table.name !== 'similar');
    return this.target.filter(isEnabledTargetTable);
  }

  openTablesDropdown(target: any, area: string) {
    const enabledTargetTables = this.getEnabledTargetTables();
    if (area === 'source' && this.currentSourceTable.name !== 'similar' && this.sourceTablesWithoutSimilar.length > 1 ||
      area === 'target' && this.currentTargetTable.name !== 'similar' && enabledTargetTables.length > 1) {
      const data = area === 'source' ? {
          tables: this.sourceTablesWithoutSimilar,
          selected: this.selectedSourceTable,
          uppercase: true
        } : {tables: enabledTargetTables, selected: this.selectedTargetTable, uppercase: true};

      const dialogOptions: OverlayConfigOptions = {
        hasBackdrop: true,
        backdropClass: 'custom-backdrop',
        panelClass: 'filter-popup',
        positionStrategyFor: 'table-dropdown',
        payload: data
      };
      const overlayRef = this.overlayService.open(dialogOptions, target, SelectTableDropdownComponent);

      overlayRef.afterClosed$.subscribe(() => {
        this.bridgeService.hideAllArrows();

        if (area === 'source') {
          this.refreshSourcePanel(data.selected);
        } else {
          this.refreshTargetPanel(this.getNewCurrentTable(this.getEnabledTargetTables().findIndex(item => item.name === data.selected.name)));
        }

      });
    }
  }

  refreshTargetPanel(data: any) {
    this.selectedTargetTable = data;
    this.targetPanel.panel.table = data;
    this.sourcePanel.panel.refreshPanel();
    this.targetPanel.panel.refreshPanel(true);
  }

  refreshSourcePanel(data: any) {
    this.selectedSourceTable = data;
    this.sourcePanel.panel.table = data;
    this.refreshTargetPanel(this.getSelectedTargetTable());
  }

  getSelectedTargetTable() {
    const enabledTargetTable = this.getEnabledTargetTables()[ 0 ];
    const clones = this.storeService.state.targetClones[ enabledTargetTable.name ];
    if (clones) {
      const enabledClones = clones.filter(item => item.cloneConnectedToSourceName === this.currentSourceTable.name);
      if (enabledClones && enabledClones.length) {
        return enabledClones[ 0 ];
      }
    }
    return enabledTargetTable;
  }

  onWheel(event: any, area: string) {
    const up = event.deltaY > 0;
    let newIndex;
    if (area === 'source' && this.currentSourceTable.name !== 'similar') {
      const index = this.source.indexOf(this.currentSourceTable);
      if (up) {
        newIndex = index === this.source.length - 1 ? this.similarSourceTable ? 1 : 0 : index + 1;
      } else {
        newIndex = index === 1 ? this.similarSourceTable ? this.source.length - 1 : 0 : index === 0 ? this.source.length - 1 : index - 1;
      }
      this.refreshSourcePanel(this.source[ newIndex ]);
    }
    if (area === 'target' && this.currentTargetTable.name !== 'similar') {
      const index = this.getEnabledTargetTables().findIndex(item => item.name === this.currentTargetTable.name);
      if (up) {
        newIndex = index === this.getEnabledTargetTables().length - 1 ? 0 : index + 1;
      } else {
        newIndex = index === 0 ? this.getEnabledTargetTables().length - 1 : index - 1;
      }
      this.refreshTargetPanel(this.getNewCurrentTable(newIndex));
    }
  }

  getNewCurrentTable(newIndex: number) {
    const newTable = this.getEnabledTargetTables()[newIndex];
    return this.storeService.state.targetClones[newTable.name] ?
      this.storeService.state.targetClones[newTable.name][0] :
      this.getEnabledTargetTables()[newIndex];
  }

  changeTargetClone(table: any) {
    this.bridgeService.hideAllArrows();
    this.refreshTargetPanel(table);
  }

  @HostListener('document:keyup', [ '$event' ])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.bridgeService.deleteSelectedArrows();
    }
  }

  previewMapping() {
    const source = this.currentSourceTable;
    const target = this.currentTargetTable;
    const name = source.name;
    const mapping = this.bridgeService.generateMapping(name, target.name);

    addViewsToMapping(mapping, source);

    addGroupMappings(mapping, source);

    if (!mapping || !mapping.mapping_items || !mapping.mapping_items.length) {
      return;
    }

    this.dataService
      .getXmlPreview(mapping)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(json => {
        this.matDialog.open(PreviewPopupComponent, {
          data: json,
          maxHeight: '80vh',
          minWidth: '80vh'
        });
      });
  }

  generateMappingJson() {
    const mappingJSON = this.bridgeService.generateMappingWithViewsAndGroups(this.source);

    this.dataService
      .getZippedXml(mappingJSON)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(file => {
        saveAs(file);
      });
  }

  openFilter(target) {

    const optionalSaveKey = this.currentTargetTable.name;

    const filteredFields = this.filteredFields ? this.filteredFields[ optionalSaveKey ] : this.filteredFields;
    const types = filteredFields ? filteredFields.types : [];
    const checkedTypes = filteredFields ? filteredFields.checkedTypes : [];

    const options = (groups as any).default;
    options[ 'individual' ] = this.currentTargetTable.rows.map(row => {
      if (!options.common.includes(row.name.toUpperCase()) && !options.concept.includes(row.name.toUpperCase())) {
        return row.name;
      }
    });
    const dialogOptions: OverlayConfigOptions = {
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: 'filter-popup',
      payload: {
        title: 'Target fields',
        saveKey: 'filteredFields',
        types,
        checkedTypes,
        options,
        optionalSaveKey
      }
    };
    this.overlayService.open(dialogOptions, target, CdmFilterComponent);
  }

  getFilteredFields() {
    return this.filteredFields ? this.filteredFields[ this.currentTargetTable.name ] : [];
  }

  onPanelOpen() {
    if (this.panelsViewInitialized.size === this.numberOfPanels) {
      this.bridgeService.refresh(this.currentTargetTable, 200);
    }
  }

  onPanelClose() {
    if (this.panelsViewInitialized.size === this.numberOfPanels) {
      this.bridgeService.refresh(this.currentTargetTable, 200);
    }
  }

  onPanelInit(table: ITable) {
    if (!this.panelsViewInitialized.has(table)) {
      this.panelsViewInitialized.add(table);
    }

    if (this.panelsViewInitialized.size === this.numberOfPanels) {
      this.commonService.setSvg(this.svgCanvas);
      this.commonService.setMain(this.mainCanvas);
    }
  }

  onTabIndexChanged(index: number, area: string): void {
    this.bridgeService.hideAllArrows();

    if (area === 'source') {
      this.sourceTabIndex = index;
    } else {
      this.targetTabIndex = index;
    }

    const wait = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (area === 'source') {
          if (index === 0 && this.similarSourceTable) {
            this.sourcePanelSimilar.panel.table = this.similarSourceTable;
            this.sourcePanelSimilar.panel.refreshPanel();
            this.targetPanel.panel.refreshPanel(true);
          }
        } else {
          if (index === 0 && this.similarTargetTable) {
            this.targetPanelSimilar.panel.table = this.similarTargetTable;
            this.targetPanelSimilar.panel.refreshPanel();
          }
        }
        this.refreshSourcePanel(this.selectedSourceTable);
        this.refreshTargetPanel(this.selectedTargetTable);
        resolve();
      }, 1000);
    });
  }

  changeTargetTabIndex() {
    const sourceTableName = this.source[ this.sourceTabIndex ].name;
    let targetTableName = this.target[ this.targetTabIndex ].name;

    if (this.mappingConfig.find(item => item.includes(sourceTableName) && item.includes(targetTableName))) {
      return;
    }

    if (sourceTableName === this.similarTableName && this.target[ 0 ].name === this.similarTableName) {
      this.targetTabIndex = 0;
    } else {
      const tagretTableNameIndex = 0;
      targetTableName = this.mappingConfig.find(item => item.includes(sourceTableName))[ tagretTableNameIndex ];
      this.targetTabIndex = this.target.findIndex(element => element.name === targetTableName);
    }
  }

  isDisabled(tableName: string): boolean {
    const activeTableName = this.currentSourceTable.name;
    return !this.mappingConfig.find(item => item.includes(tableName) && item.includes(activeTableName));
  }

  isSimilarTabs() {
    if (!this.source && !this.target) {
      return false;
    }

    return (
      this.currentSourceTable.name === this.similarTableName ||
      this.currentTargetTable.name === this.similarTableName
    );
  }

  isTooltipDisabled() {
    if (this.target && this.filteredFields) {
      return !(
        this.filteredFields &&
        this.filteredFields[ this.currentTargetTable.name ] &&
        this.filteredFields[ this.currentTargetTable.name ].types &&
        this.filteredFields[ this.currentTargetTable.name ].types.length
      );
    }
  }

  isMappingEmpty() {
    return Object.keys(this.bridgeService.arrowsCache).length === 0;
  }

  isTableMappingEmpty() {
    return Object.values(this.bridgeService.arrowsCache)
      .filter(item => item.source.tableName === this.currentSourceTable.name && item.target.tableName === this.currentTargetTable.name).length === 0;
  }

  deleteLinks() {
    const dialog = this.matDialog.open(DeleteWarningComponent, {
      closeOnNavigation: false,
      disableClose: false,
      panelClass: 'warning-dialog',
      data: {
        title: 'Links',
        message: 'You want to delete all links'
      }
    });

    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.bridgeService.deleteArrowsForMapping(this.currentTargetTable.name, this.currentSourceTable.name, this.currentTargetTable.cloneName);
        this.bridgeService.refreshAll();
      }
    });
  }

  generateReport() {
    this.reportGenerationService
      .setSource(this.source)
      .setMappingConfig(this.mappingConfig)
      .setSimilarTableName(this.similarTableName)
      .generateReport(ReportType.WORD)
  }

  generateFakeData() {
    this.matDialog.open(FakeDataDialogComponent, {
      width: '253',
      height: '270',
      disableClose: true,
      panelClass: 'scan-data-dialog'
    });
  }

  convertToCdm() {
    this.addMappedSourceToStore();

    this.matDialog.open(CdmDialogComponent, {
      width: '700',
      height: '674',
      disableClose: true,
      panelClass: 'scan-data-dialog'
    });
  }

  showVocabulary() {
    this.isVocabularyVisible = !this.isVocabularyVisible;
    this.setMainHeight();
    this.vocabularyObserverService.next({
      value: this.isVocabularyVisible,
      emit: false
    });
  }

  setMainHeight() {
    let sub = 81; // footer height
    if (this.isVocabularyVisible) {
      sub += 465; // vocabulary search dialog height
    }

    this.mainHeight = `calc(100% - ${sub}px)`;
  }

  private addMappedSourceToStore() {
    this.storeService.add('mappedSource', this.source);
  }

  private saveMappingStatus() {
    this.storeService.add('mappingEmpty', this.isMappingEmpty());
  }

  private initHasScanReport() {
    this.hasScanReport = this.storeService.state.reportFile;
  }

  private loadMapping() {
    const { source, target } = this.storeService.getMappedTables();

    this.prepareTables(source, Area.Source);
    this.prepareTables(target, Area.Target);
    this.prepareMappedTables(this.getMappingConfig());
    this.moveSimilarTables();
    if (!this.storeService.state.recalculateSimilar) {
      if (this.similarSourceTable) {
        this.similarSourceTable.rows = this.storeService.state.sourceSimilar;
      }
      if (this.similarTargetTable) {
        this.similarTargetTable.rows = this.storeService.state.targetSimilar;
      }
    } else {
      if (this.similarSourceTable) {
        this.storeService.state.sourceSimilar = this.similarSourceTable.rows;
      }
      if (this.similarTargetTable) {
        this.storeService.state.targetSimilar = this.similarTargetTable.rows;
      }
      this.storeService.state.recalculateSimilar = false;
    }
    this.sourceTablesWithoutSimilar = this.source.filter(item => item.name !== 'similar');
    this.selectedSourceTable = this.sourceTablesWithoutSimilar[0];

    this.selectedTargetTable = this.getSelectedTargetTable();

    this.numberOfPanels = this.source.find(item => item.name === 'similar') ?
      this.target.find(item => item.name === 'similar') ? numberOfPanelsWithTwoSimilar : numberOfPanelsWithOneSimilar : numberOfPanelsWithoutSimilar;

    setTimeout(() => {
      this.bridgeService.refresh(this.currentTargetTable);
      this.sourcePanel.panel.reflectConnectorsPin(this.currentSourceTable);
      this.targetPanel.panel.reflectConnectorsPin(this.currentTargetTable);
      this.bridgeService.adjustArrowsPositions();
    }, 200);

    this.rulesPoupService.deleteConnector$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(connectorKey => {
        this.bridgeService.deleteArrow(connectorKey);
      });

    this.storeService.state$.subscribe(res => {
      if (res) {
        this.filteredFields = res.filteredFields;
        this.bridgeService.refreshAll();
      }
    });
    this.activatedRoute.queryParams.subscribe(data => {
      if (Object.keys(data).length !== 0) {
        this.targetTabIndex = 1;
        this.sourceTabIndex = 1;
        const sourceIndex = this.sourceTablesWithoutSimilar.findIndex(item => item.name === data.sourceTable);
        this.selectedSourceTable = this.sourceTablesWithoutSimilar[sourceIndex];
        this.selectedTargetTable = this.getNewCurrentTable(this.getEnabledTargetTables().findIndex(item => item.name === data.targetTable));
      }
    });
  }

  private subscribeOnVocabularyOpening() {
    this.vocabularyObserverService.show$.subscribe(visible => {
      this.isVocabularyVisible = visible;
      this.setMainHeight();
    })
  }

  private subscribeOnPrepareReportGenerationConfig() {
    this.reportGenerationService.reportConfigPrepare$
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => this.reportGenerationService
        .setSource(this.source)
        .setMappingConfig(this.mappingConfig)
        .setSimilarTableName(this.similarTableName)
        .emit(ReportGenerationEvent.READY)
      )
  }
}
