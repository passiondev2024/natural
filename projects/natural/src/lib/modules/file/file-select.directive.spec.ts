import {ViewChild, Component, NgModule} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NaturalFileSelectDirective} from './file-select.directive';
import {NaturalFileModule} from './file.module';

@Component({
    template: '<input type="file" naturalFileSelect />',
})
export class ContainerComponent {
    @ViewChild(NaturalFileSelectDirective) public ngf!: NaturalFileSelectDirective;
}

@NgModule({
    imports: [NaturalFileModule],
    declarations: [ContainerComponent],
})
export class AppModule {}

describe('naturalFileSelect', () => {
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
