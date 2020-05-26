import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {NaturalHierarchicSelectorModule, NaturalIconModule, NaturalSelectEnumModule} from '@ecodev/natural';
import {ApolloTestingModule} from 'apollo-angular/testing';
import {MaterialModule} from '../material.module';
import {SelectEnumComponent} from './select-enum.component';

describe('Demo SelectComponent', () => {
    let component: SelectEnumComponent;
    let fixture: ComponentFixture<SelectEnumComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectEnumComponent],
            imports: [
                RouterTestingModule,
                NoopAnimationsModule,
                MaterialModule,
                FormsModule,
                ReactiveFormsModule,
                NaturalSelectEnumModule,
                ApolloTestingModule,
                NaturalHierarchicSelectorModule,
                NaturalIconModule.forRoot({}),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectEnumComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
