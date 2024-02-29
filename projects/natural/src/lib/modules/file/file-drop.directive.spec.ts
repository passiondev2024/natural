import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalFileService} from '@ecodev/natural';
import {NaturalFileDropDirective} from './file-drop.directive';

@Component({
    template: '<div i18n naturalFileDrop>my drag and drop area</div>',
    standalone: true,
    imports: [NaturalFileDropDirective],
})
class ContainerComponent {
    @ViewChild(NaturalFileDropDirective) public ngf!: NaturalFileDropDirective;
}

describe('NaturalFileDropDirective', () => {
    let fixture: ComponentFixture<ContainerComponent>;
    let component: ContainerComponent;
    let uploadService: NaturalFileService;

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;
        uploadService = TestBed.inject(NaturalFileService);
    });

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
