import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {NaturalDropdownComponentsModule, NaturalHierarchicSelectorModule, NaturalIconModule} from '@ecodev/natural';
import {ApolloModule} from 'apollo-angular';

import {HierarchicComponent} from './hierarchic.component';

describe('HierarchicComponent', () => {
    let component: HierarchicComponent;
    let fixture: ComponentFixture<HierarchicComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [HierarchicComponent],
                imports: [
                    NoopAnimationsModule,
                    ApolloModule,
                    RouterTestingModule,
                    NaturalIconModule.forRoot({}),
                    NaturalHierarchicSelectorModule,
                    NaturalDropdownComponentsModule,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(HierarchicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
