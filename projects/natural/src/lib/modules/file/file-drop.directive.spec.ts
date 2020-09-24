import {Component, NgModule} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NaturalFileModule} from './file.module';

@Component({
    template: '<input type="file" naturalFileDrop />',
})
export class ContainerComponent {}

@NgModule({
    imports: [NaturalFileModule],
    declarations: [ContainerComponent],
})
export class AppModule {}

describe('naturalFileDrop', () => {
    let fixture: ComponentFixture<ContainerComponent>;
    let component: ContainerComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [AppModule],
            });

            return TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(ContainerComponent);
                fixture.detectChanges();
                component = fixture.componentInstance;
            });
        }),
    );

    it('inits', () => {
        expect(fixture).not.toBeNull();
        expect(component).not.toBeNull();
    });
});
