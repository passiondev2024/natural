import {OverlayContainer} from '@angular/cdk/overlay';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
    HierarchicDialogConfig,
    HierarchicDialogResult,
    NaturalHierarchicSelectorDialogService,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    OrganizedModelSelection,
} from '@ecodev/natural';

describe('NaturalHierarchicSelectorDialogService', () => {
    let dialog: NaturalHierarchicSelectorDialogService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NaturalIconModule.forRoot({}), NaturalHierarchicSelectorModule],
            providers: [NaturalHierarchicSelectorDialogService],
        });
        dialog = TestBed.inject(NaturalHierarchicSelectorDialogService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should open dialog, use and return the selected value', fakeAsync(() => {
        const config: HierarchicDialogConfig = {
            hierarchicConfig: [],
            hierarchicSelection: {test: [{asdf: 'qwer'}]},
        };

        const dialogRef = dialog.open(config);
        const dialogCloseSpy = spyOn(dialogRef, 'close');

        expect(dialogRef.componentInstance.config).toEqual(config);

        dialogRef.componentInstance.close({test: [{asdf: 'qwer'}]} as OrganizedModelSelection);

        flush();

        const result: HierarchicDialogResult = {
            hierarchicSelection: {test: [{asdf: 'qwer'}]},
            searchSelections: undefined,
        };

        expect(dialogCloseSpy).toHaveBeenCalledOnceWith(result);
    }));
});
