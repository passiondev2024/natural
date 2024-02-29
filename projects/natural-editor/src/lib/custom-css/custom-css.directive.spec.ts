import {Component} from '@angular/core';
import {NaturalCustomCssDirective, prefixCss} from './custom-css.directive';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DOCUMENT} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';

@Component({
    template: ` <div id="test1" naturalCustomCss="p {background: pink;}"></div>
        <div id="test2" [naturalCustomCss]="css"></div>`,
    standalone: true,
    imports: [NaturalCustomCssDirective],
})
class TestComponent {
    public readonly missing = undefined;
    public css: string | undefined = 'p {border: 1px solid red;} h1 {background: red;}';
}

describe('NaturalLinkableTabDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let document: Document;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        document = TestBed.inject(DOCUMENT);
    });

    it('should inject CSS and remove it', () => {
        fixture.detectChanges();

        const expected1 = `[data-natural-id=n1] p {background: pink;}`;
        const expected2 = `[data-natural-id=n2] p {border: 1px solid red;}
[data-natural-id=n2] h1 {background: red;}`;

        expect(document.head.innerText).toContain(expected1);
        expect(document.head.innerText).toContain(expected2);

        expect(fixture.debugElement.query(By.css('[data-natural-id=n1]')).nativeElement.id).toBe('test1');
        expect(fixture.debugElement.query(By.css('[data-natural-id=n2]')).nativeElement.id).toBe('test2');

        // Can remove css with undefined
        component.css = undefined;
        fixture.detectChanges();
        expect(document.head.innerText).toContain(expected1);
        expect(document.head.innerText).not.toContain(expected2);

        // Nothing is left after destroying
        fixture.destroy();
        expect(document.head.innerText).not.toContain(expected1);
        expect(document.head.innerText).not.toContain(expected2);
    });
});

describe('prefixCss', () => {
    const cases: [string, string][] = [
        [``, ``],
        [
            `.my-class[attr=value]:hover {background-image:url("http:/example.com/image.png");}`,
            `prefix .my-class[attr=value]:hover {background-image:url("http:/example.com/image.png");}`,
        ],
        [`.my-class {background: #ffBB98}`, `prefix .my-class {background: #ffBB98}`],
        [
            `.class
{
background: red;
}

.cl1, .cl2 {background-color: rgb(2,3,4);}`,
            `prefix .class
{
background: red;
}
prefix .cl1,
prefix .cl2 {background-color: rgb(2,3,4);}`,
        ],
        [
            `@media screen and (max-width:300px) {.cl1 {background-color: rgb(2,3,4);}}`,
            `@media screen and (max-width:300px) {
prefix .cl1 {background-color: rgb(2,3,4);}}`,
        ],
    ];

    cases.forEach(([input, expected]) => {
        it(input, () => {
            expect(prefixCss('prefix', input)).toBe(expected);
        });
    });
});
