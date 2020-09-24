import {Component, NgModule} from '@angular/core';
import {inject, ComponentFixture, TestBed, async} from '@angular/core/testing';
import {ngfModule} from './ngf.module';

@Component({
    selector: 'container',
    template: '<input type="file" #ngf="ngfDrop" ngfDrop />',
})
export class ContainerComponent {}

@NgModule({
    imports: [ngfModule],
    declarations: [ContainerComponent],
})
export class AppModule {}

describe('ngfDrop', () => {
    let fixture: ComponentFixture<ContainerComponent>;
    let component: any;

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
    });
});
