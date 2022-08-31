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

    it('should broadcast to service', done => {
        mockSelectedFile(fixture);

        let called = 0;
        service.filesChanged.subscribe(() => called++);
        component.ngf.onChange(new CustomEvent('custom'));

        setTimeout(() => {
            expect(called).toBe(1);
            done();
        }, 1000);
    });

    it('should not broadcast to service when disabled', done => {
        mockSelectedFile(fixture);

        let called = 0;
        service.filesChanged.subscribe(() => called++);
        component.ngf.broadcast = false;
        component.ngf.onChange(new CustomEvent('custom'));

        setTimeout(() => {
            expect(called).toBe(0);
            done();
        }, 1000);
    });

    it('should accept files', done => {
        mockSelectedFile(fixture);

        service.filesChanged.subscribe(selection => {
            expect(selection.valid.length).toBe(1);
            expect(selection.invalid.length).toBe(0);
            done();
        });

        component.ngf.onChange(new CustomEvent('custom'));
    });

    it('should reject directories', done => {
        // mock a folder
        mockSelectedFile(fixture, '');

        service.filesChanged.subscribe(selection => {
            expect(selection.valid.length).toBe(0);
            expect(selection.invalid.length).toBe(1);
            expect(selection.invalid[0].error).toBe('directory');
            done();
        });

        component.ngf.onChange(new CustomEvent('custom'));
    });
});

function mockSelectedFile(fixture: ComponentFixture<ContainerComponent>, content = 'content'): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const list = new DataTransfer();

    list.items.add(new File([content], 'filename.jpg'));
    input.files = list.files;
}
