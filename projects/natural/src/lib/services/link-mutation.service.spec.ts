import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { NaturalLinkMutationService } from './link-mutation.service';
import { MockApolloProvider } from '../../shared/testing/MockApolloProvider';

describe('NaturalLinkMutationService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockApolloProvider,
            ],
        });
    });

    const license = {id: '456', __typename: 'License'};
    const item = {id: '456', __typename: 'Bookable'};
    const company = {id: '456', __typename: 'Company'};

    const expectedLink = {
        data: {
            linkLicenseBookable: license,
        },
    };

    const expectedUnlink = {
        data: {
            unlinkLicenseBookable: license,
        },
    };

    it('should be able to link', fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
        let actual: any = null;
        tick();
        service.link(license, item).subscribe(v => actual = v);
        tick();

        expect(actual).toEqual(expectedLink);
    })));

    it('should be able to link in reverse order', fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
        let actual: any = null;
        tick();
        service.link(item, license).subscribe(v => actual = v);
        tick();

        expect(actual).toEqual(expectedLink);
    })));

    it('should be able to link with extra variables',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let actual: any = null;
            tick();
            service.link(license, item, null, {isMain: true}).subscribe(v => actual = v);
            tick();

            expect(actual).toEqual(expectedLink);
        })));

    it('should be able to unlink', fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
        let actual: any = null;
        tick();
        service.unlink(license, item).subscribe(v => actual = v);
        tick();

        expect(actual).toEqual(expectedUnlink);
    })));

    it('should be able to unlink in reverse order',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let actual: any = null;
            tick();
            service.unlink(item, license).subscribe(v => actual = v);
            tick();

            expect(actual).toEqual(expectedUnlink);
        })));

    it('should throw for non-existing link mutation',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let error: any = null;
            tick();
            service.link(license, company).subscribe(() => null, (e) => error = e);
            tick();

            expect(error).not.toBeNull();
            expect(error.message).toEqual('API does not allow to link License and Company');
        })));

    it('should throw for non-existing unlink mutation',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let error: any = null;
            tick();
            service.unlink(license, company).subscribe(() => null, (e) => error = e);
            tick();

            expect(error).not.toBeNull();
            expect(error.message).toEqual('API does not allow to unlink License and Company');
        })));

    // TODO: Unfortunately we don't have a model that allow use to easily test semantic linking
    // TODO: This should be restored if/when we a model that allow it again, or it should be ported to OKpilot
    // const category1 = {id: '456', __typename: 'Category'};
    // const category2 = {id: '789', __typename: 'Category'};
    // const expectedCategoryLink = {
    //     data: {
    //         linkCategoryParent: category1,
    //     },
    // };
    //
    // it('should be able to link with specific semantic', fakeAsync(inject([NaturalLinkMutationService], (service:
    // NaturalLinkMutationService) => { let actual: any = null; tick(); service.link(category1, category2, 'parent').subscribe(v => actual
    // = v); tick();  expect(actual).toEqual(expectedCategoryLink); })));  it('should be able to link with specific semantic in reverse
    // order and have different result', fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => { let
    // actual: any = null; tick(); service.link(category2, category1, 'parent').subscribe(v => actual = v); tick();
    // expect(actual).toEqual(expectedCategoryLink); })), );
});
