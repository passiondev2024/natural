import {Component, NgModule, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NaturalFileModule} from './file.module';
import {NaturalFileDropDirective, NaturalFileService} from '@ecodev/natural';

@Component({
    template: '<div naturalFileDrop>my drag and drop area</div>',
})
export class ContainerComponent {
    @ViewChild(NaturalFileDropDirective) public ngf!: NaturalFileDropDirective;
}

@NgModule({
    imports: [NaturalFileModule],
    declarations: [ContainerComponent],
})
export class AppModule {}

describe('NaturalFileDropDirective', () => {
    let fixture: ComponentFixture<ContainerComponent>;
    let component: ContainerComponent;
    let uploadService: NaturalFileService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [AppModule],
            });

            return TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(ContainerComponent);
                fixture.detectChanges();
                component = fixture.componentInstance;
                uploadService = TestBed.inject(NaturalFileService);
            });
        }),
    );

    it('should create an instance', () => {
        expect(fixture).toBeTruthy();
        expect(component).toBeTruthy();
    });

    it('should apply css class when dragover', () => {
        const event: CustomEvent = new CustomEvent('dragover');
        const element: HTMLElement = fixture.nativeElement.childNodes[0];

        expect(element.className).toBe('');

        // While nobody listens to the uploadService.filesChanged, "over" class should not be there
        element.dispatchEvent(event);
        fixture.detectChanges();
        expect(element.className).toBe('');

        // Subscribe to files
        uploadService.filesChanged.subscribe();

        // Now that we have subscriber, the class must have been changed immediately after event
        element.dispatchEvent(event);
        fixture.detectChanges();
        expect(element.className).toBe('natural-file-over');
    });

    it('should not apply css class when dragover if broadcast is disabled', () => {
        const event: CustomEvent = new CustomEvent('dragover');
        const element: HTMLElement = fixture.nativeElement.childNodes[0];

        // Disable broadcast
        component.ngf.broadcast = false;

        // Subscribe to files
        uploadService.filesChanged.subscribe();

        // Now that we have subscriber, but broascast is disabled, the class must not change
        element.dispatchEvent(event);
        fixture.detectChanges();
        expect(element.className).toBe('');
    });
});
