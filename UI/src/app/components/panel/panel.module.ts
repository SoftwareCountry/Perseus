import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatExpansionModule } from '@angular/material/expansion';
import { CdmCommonModule } from 'src/app/common/cdm-common.module';
import { FilterComponent } from 'src/app/components/filter/filter.component';
import { PanelTableComponent } from 'src/app/components/panel/panel-table/panel-table.component';
import { PanelComponent } from 'src/app/components/panel/panel.component';
import { DraggableDirective } from 'src/app/directives/draggable.directive';
import { DrawService } from 'src/app/services/draw.service';
import { AreaComponent } from 'src/app/components/area/area.component';

@NgModule({
  declarations: [
    AreaComponent,
    PanelComponent,
    PanelTableComponent,
    DraggableDirective,
    FilterComponent
  ],
  exports: [
    PanelComponent,
    PanelTableComponent,
    FilterComponent,
    CdmCommonModule
  ],
  imports: [
    MatExpansionModule,
    CommonModule,
    CdmCommonModule
  ],
  providers: [DrawService]

})
export class PanelModule {
}