import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDropdownComponentsModule,
    NaturalFileModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalRelationsModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {MaterialModule} from '../material.module';
import {FileComponent} from './file.component';
import {FormsModule} from '@angular/forms';

describe('Demo FileComponent', () => {
    let component: FileComponent;
    let fixture: ComponentFixture<FileComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [FileComponent],
                imports: [
                    FormsModule,
                    RouterTestingModule,
                    BrowserAnimationsModule,
                    MaterialModule,
                    NaturalAlertModule,
                    NaturalStampModule,
                    NaturalSelectModule,
                    NaturalSidenavModule,
                    NaturalRelationsModule,
                    NaturalFixedButtonModule,
                    NaturalTableButtonModule,
                    NaturalDetailHeaderModule,
                    NaturalColumnsPickerModule,
                    NaturalFixedButtonDetailModule,
                    NaturalHierarchicSelectorModule,
                    NaturalDropdownComponentsModule,
                    NaturalCommonModule,
                    NaturalFileModule,
                    NaturalIconModule.forRoot({}),
                ],
                providers: [MockApolloProvider],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(FileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
