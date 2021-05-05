import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GridComponent } from '../grid.component';
import { Selectable } from '../../models/grid/selectable';
import { columnToField } from '../../models/grid/grid';

@Component({
  selector: 'app-selectable-grid',
  templateUrl: './selectable-grid.component.html',
  styleUrls: [
    '../grid.component.scss',
    './selectable-grid.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableGridComponent<T extends Selectable> extends GridComponent<T> implements OnInit {

  @Input()
  data: T[]

  @Input()
  sortable = false

  @Input()
  checkedAll: boolean

  ngOnInit(): void {
    this.displayedColumns = [
      '__select__',
      ...this.columns.map(columnToField)
    ]
  }

  select(row: {selected: boolean; [key: string]: any}) {
    row.selected = !row.selected
    this.setCheckedAll()
  }

  selectAll() {
    this.checkedAll = !this.checkedAll
    this.data.forEach(row => row.selected = this.checkedAll)
  }

  private setCheckedAll() {
    this.checkedAll = this.data.every(row => row.selected)
  }
}