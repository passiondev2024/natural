import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalSrcDensityDirective} from './src-density.directive';
import {By} from '@angular/platform-browser';

@Component({
    template: `
        <img naturalSrcDensity />
        <img naturalSrcDensity="https://example.com/image/123/200" />
        <img [naturalSrcDensity]="'https://example.com/image/123/200'" />
        <img [naturalSrcDensity]="'https://example.com/image/123.jpg'" />
        <img src="foo.jpg" srcset="bar.jpg" naturalSrcDensity="https://example.com/image/123/200" />
        <img src="foo.jpg" srcset="bar.jpg" naturalSrcDensity="https://example.com/image/123.jpg" />
        <img naturalSrcDensity="https://example.com/image/123/201" />
    `,
})
class TestComponent {}

describe('NaturalSrcDensityDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let elements: DebugElement[]; // the three elements w/ the directive

    const expectedSrc = 'https://example.com/image/123/200';
    const expectedSrcset =
        'https://example.com/image/123/200, https://example.com/image/123/300 1.5x, https://example.com/image/123/400 2x, https://example.com/image/123/600 3x, https://example.com/image/123/800 4x';
    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            declarations: [NaturalSrcDensityDirective, TestComponent],
        }).createComponent(TestComponent);

        fixture.detectChanges(); // initial binding

        // all elements with an attached NaturalSrcDensityDirective
        elements = fixture.debugElement.queryAll(By.directive(NaturalSrcDensityDirective));
    });

    it('should have 7 active elements', () => {
        expect(elements.length).toBe(7);
    });

    it('1st should be kept empty and should not be used in real world', () => {
        expect(elements[0].nativeElement.src).toBe('');
        expect(elements[0].nativeElement.srcset).toBe('');
    });

    it('2nd should work', () => {
        expect(elements[1].nativeElement.src).toBe(expectedSrc);
        expect(elements[1].nativeElement.srcset).toBe(expectedSrcset);
    });

    it('3rd should work', () => {
        expect(elements[2].nativeElement.src).toBe(expectedSrc);
        expect(elements[2].nativeElement.srcset).toBe(expectedSrcset);
    });

    it('4th should keep naturalSrcDensity as-is without srcset', () => {
        expect(elements[3].nativeElement.src).toBe('https://example.com/image/123.jpg');
        expect(elements[3].nativeElement.srcset).toBe('');
    });

    it('5th will completely discard original src and srcset attributes', () => {
        expect(elements[4].nativeElement.src).toBe(expectedSrc);
        expect(elements[4].nativeElement.srcset).toBe(expectedSrcset);
    });

    it('6th will completely discard original src and srcset attributes while keeping naturalSrcDensity as-is', () => {
        expect(elements[5].nativeElement.src).toBe('https://example.com/image/123.jpg');
        expect(elements[5].nativeElement.srcset).toBe('');
    });

    it('6th will completely discard original src and srcset attributes while keeping naturalSrcDensity as-is', () => {
        const expectedSrcsetUneven =
            'https://example.com/image/123/201, https://example.com/image/123/302 1.5x, https://example.com/image/123/402 2x, https://example.com/image/123/603 3x, https://example.com/image/123/804 4x';

        expect(elements[6].nativeElement.src).toBe('https://example.com/image/123/201');
        expect(elements[6].nativeElement.srcset).toBe(expectedSrcsetUneven);
    });
});
