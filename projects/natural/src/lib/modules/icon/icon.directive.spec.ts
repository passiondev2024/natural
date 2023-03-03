import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalIconModule} from './icon.module';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

@Component({
    template: `
        <mat-icon fontIcon="search" />
        <mat-icon naturalIcon="search" />
        <mat-icon naturalIcon="customFontName" />
        <mat-icon naturalIcon="customSvgName" />
        <mat-icon naturalIcon="search" [size]="150" />
        <mat-icon naturalIcon="" />
        <mat-icon naturalIcon="customFontNameWhichIsEmpty" />
    `,
})
class TestComponent {}

function assertIcon(debugElement: DebugElement, type: 'font' | 'svg', name: null | string, size: string): void {
    const el = debugElement.nativeElement;

    expect(el.getAttribute('data-mat-icon-type')).toBe(type);
    expect(el.getAttribute('data-mat-icon-name')).toBe(name);
    expect(el.style.fontSize).toBe(size);
    expect(el.style.minHeight).toBe(size);
    expect(el.style.minWidth).toBe(size);
}

describe('NaturalIconComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let elements: DebugElement[]; // the elements with the directive
    let httpTestingController: HttpTestingController;

    beforeEach(async () => {
        fixture = TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [
                HttpClientTestingModule,
                MatIconModule,
                NaturalIconModule.forRoot({
                    customFontName: {font: 'download'},
                    customSvgName: {svg: 'foo.svg'},
                    customFontNameWhichIsEmpty: {font: ''},
                }),
            ],
        }).createComponent(TestComponent);

        fixture.detectChanges(); // initial binding

        httpTestingController = TestBed.inject(HttpTestingController);
        elements = fixture.debugElement.queryAll(By.css('mat-icon'));
    });

    afterEach(() => httpTestingController.verify());

    it('should display either font or svg icon with optional sizing', () => {
        const request = httpTestingController.expectOne('foo.svg');
        expect(request.request.method).toEqual('GET');
        request.flush('<svg></svg>');

        assertIcon(elements[0], 'font', 'search', '');
        assertIcon(elements[1], 'font', 'search', '');
        assertIcon(elements[2], 'font', 'download', '');
        assertIcon(elements[3], 'svg', 'customSvgName', '');
        assertIcon(elements[4], 'font', 'search', '150px');
        assertIcon(elements[5], 'font', null, '');
        assertIcon(elements[6], 'font', null, '');
    });
});
