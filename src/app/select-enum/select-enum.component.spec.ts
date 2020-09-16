import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {NaturalHierarchicSelectorModule, NaturalIconModule, NaturalSelectModule} from '@ecodev/natural';
import {ApolloTestingModule} from 'apollo-angular/testing';
import {MaterialModule} from '../material.module';
import {SelectEnumComponent} from './select-enum.component';

describe('Demo SelectEnumComponent', () => {
    let component: SelectEnumComponent;
    let fixture: ComponentFixture<SelectEnumComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [SelectEnumComponent],
                imports: [
                    RouterTestingModule,
                    NoopAnimationsModule,
                    MaterialModule,
                    FormsModule,
                    ReactiveFormsModule,
                    NaturalSelectModule,
                    ApolloTestingModule,
                    NaturalHierarchicSelectorModule,
                    NaturalIconModule.forRoot({}),
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectEnumComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
