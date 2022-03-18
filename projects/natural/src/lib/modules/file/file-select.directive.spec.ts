import {Component, NgModule, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalFileSelectDirective} from './file-select.directive';
import {NaturalFileModule} from './file.module';
import {NaturalFileService} from './file.service';

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
    let service: NaturalFileService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppModule],
        });

        return TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ContainerComponent);
            fixture.detectChanges();
            component = fixture.componentInstance;
            service = TestBed.inject(NaturalFileService);
        });
    });

    it('inits', () => {
        expect(fixture).not.toBeNull();
        expect(component).not.toBeNull();
        expect(component.ngf.selectable).toBe(true);
    });

    it('should broadcast to service', () => {
        mockSelectedFile(fixture);

        let called = 0;
        service.filesChanged.subscribe(() => called++);
        component.ngf.onChange(new CustomEvent('custom'));
        expect(called).toBe(1);
    });

    it('should not broadcast to service when disabled', () => {
        mockSelectedFile(fixture);

        let called = 0;
        service.filesChanged.subscribe(() => called++);
        component.ngf.broadcast = false;
        component.ngf.onChange(new CustomEvent('custom'));
        expect(called).toBe(0);
    });
});

function mockSelectedFile(fixture: ComponentFixture<ContainerComponent>): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const list = new DataTransfer();

    list.items.add(new File(['content'], 'filename.jpg'));
    input.files = list.files;
}
