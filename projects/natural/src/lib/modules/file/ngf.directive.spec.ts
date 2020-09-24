import {Component, NgModule} from '@angular/core';
import {inject, ComponentFixture, TestBed, async} from '@angular/core/testing';
//import { By } from '@angular/platform-browser';
import {ngfModule} from './ngf.module';

@Component({
    selector: 'container',
    template: '<input type="file" #ngf="ngf" ngf (init)="ngf2=$event" />',
})
export class ContainerComponent {}

@NgModule({
    imports: [ngfModule],
    declarations: [ContainerComponent],
})
export class AppModule {}

describe('ngf', () => {
    let fixture: ComponentFixture<ContainerComponent>;
    let component;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [AppModule],
        });

        return TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ContainerComponent);
            fixture.detectChanges();
            component = fixture.componentInstance;
        });
    }));

    it('inits', () => {
        expect(fixture).not.toBeNull();
        expect(component).not.toBeNull();
        expect(component.ngf).not.toBeNull();
        expect(component.ngf2).not.toBeNull();
    });
});
