import { BaseComponent } from '@shared/base/base.component';
import { 
    Component, 
    OnInit, 
    OnDestroy, 
    ElementRef,
    ViewChild, 
    Renderer2
} from "@angular/core";

@Component({
    selector: 'app-cdm-tables-settings',
    templateUrl: './cdm-tables-settings.component.html',
    styleUrls: ['./cdm-tables-settings.component.scss'],
})
export class CdmTablesSettingsComponent extends BaseComponent implements OnInit, OnDestroy {
    @ViewChild('settings', {static: true}) settingsEl: ElementRef;
    @ViewChild('settingsBtn', {static: true,  read: ElementRef}) settingsBtn: ElementRef;

    private handleClickPopup: () => void;

    public showSettings = false;

    constructor(private renderer: Renderer2) {
        super();
    }


    ngOnInit(): void {
        this.handleClickPopup = this.renderer.listen('document', 'click', event => {
            const clickedInside = this.settingsEl.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showSettings = false;
                return;
            }

            const clickedBtn = this.settingsBtn.nativeElement.contains(event.target);
            this.showSettings = clickedBtn ? !this.showSettings : this.showSettings;
            
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.handleClickPopup) {
            this.handleClickPopup();
        }
    }

}