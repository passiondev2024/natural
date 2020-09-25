import {Component, NgModule} from '@angular/core';
import {ComponentFixture, inject, TestBed, waitForAsync} from '@angular/core/testing';
import {NaturalFileModule} from './file.module';
import {NaturalFileService} from '@ecodev/natural';

@Component({
    template: '<div naturalFileDrop>my drag and drop area</div>',
})
export class ContainerComponent {}

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

                inject([NaturalFileService], (service: NaturalFileService) => {
                    uploadService = service;
                })();
            });
        }),
    );

    it('should create an instance', () => {
        expect(fixture).toBeTruthy();
        expect(component).toBeTruthy();
    });

    it('should create an instance', done => {
        const event: CustomEvent & {dataTransfer?: {files: {type: string}[]}} = new CustomEvent('dragover', {
            bubbles: true,
            cancelable: true,
        });
        event.dataTransfer = {
            files: [{type: 'image/png'}],
        };

        const element = fixture.nativeElement.childNodes[0];
        expect(element.className).toBe('');

        element.dispatchEvent(event);

        // While nobody listens to the uploadService.filesChanged, "over" class should not be there
        setTimeout(() => {
            expect(element.className).toBe('');

            // Subscribe to files
            uploadService.filesChanged.subscribe();
            element.dispatchEvent(event);

            // After a short while the class must have been changed
            setTimeout(() => {
                fixture.detectChanges();
                expect(element.className).toBe('natural-file-over');
                done();
            }, 220);
        }, 220);
    });
});
