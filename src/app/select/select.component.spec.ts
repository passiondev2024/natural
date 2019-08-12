import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NaturalHierarchicSelectorModule, NaturalSelectModule } from '@ecodev/natural';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { MaterialModule } from '../material.module';

import { SelectComponent } from './select.component';

describe('Demo SelectComponent', () => {
    let component: SelectComponent;
    let fixture: ComponentFixture<SelectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SelectComponent,
            ],
            imports: [
                RouterTestingModule,
                NoopAnimationsModule,
                MaterialModule,
                FormsModule,
                NaturalSelectModule,
                ApolloTestingModule,
                NaturalHierarchicSelectorModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
