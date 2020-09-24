import {ViewChild, Component, NgModule} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ngfSelect} from './ngfSelect.directive';
import {NaturalFileModule} from './file.module';

@Component({
    template: '<input type="file" ngfSelect />',
})
export class ContainerComponent {
    @ViewChild(ngfSelect) public ngf!: ngfSelect;
}

@NgModule({
    imports: [NaturalFileModule],
    declarations: [ContainerComponent],
})
export class AppModule {}

describe('ngfSelect', () => {
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
        expect(component.ngf.selectable).toBe(true);
    });
});
