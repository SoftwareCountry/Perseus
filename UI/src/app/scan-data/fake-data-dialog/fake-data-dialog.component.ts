import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractScanDialog } from '../abstract-scan-dialog';
import { StoreService } from '../../services/store.service';
import { fileToBase64 } from '../../util/base64-util';

@Component({
  selector: 'app-fake-data-dialog',
  templateUrl: './fake-data-dialog.component.html',
  styleUrls: ['./fake-data-dialog.component.scss', '../styles/scan-dialog.scss', '../styles/scan-data-normalize.scss']
})
export class FakeDataDialogComponent extends AbstractScanDialog {

  constructor(dialogRef: MatDialogRef<FakeDataDialogComponent>, private storeService: StoreService) {
    super(dialogRef);
  }

  set index(value: number) {
    this.selectedIndex = value;
    this.changeSize();
  }

  get index() {
    return this.selectedIndex;
  }

  onGenerationCancel() {
    this.index = 0;
  }

  async onGenerate(params: { maxRowCount: number, doUniformSampling: boolean }) {
    const state = this.storeService.state;
    const scanReportBase64 = (await fileToBase64(state.reportFile)).base64;
    const itemsToScanCount = state.source.length;

    this.websocketParams = {
      destination: '/fake-data',
      payload: {
        ...params,
        scanReportBase64,
      },
      itemsToScanCount,
      resultDestination: '/user/queue/fake-data'
    };

    this.index = 1;
  }

  private changeSize() {
    if (this.selectedIndex === 0) {
      this.dialogRef.updateSize('253px', '270px');
    } else {
      this.dialogRef.updateSize('700px', '674px');
    }
  }
}