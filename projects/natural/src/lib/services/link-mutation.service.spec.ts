import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { MockApolloProvider } from '../testing/mock-apollo.provider';
import { NaturalLinkMutationService } from './link-mutation.service';

describe('NaturalLinkMutationService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockApolloProvider,
            ],
        });
    });

    const post = {id: '456', __typename: 'Post'};
    const blog = {id: '456', __typename: 'Blog'};
    const nonExisting = {id: '456', __typename: 'NonExisting'};

    const expectedLink = {
        data: {
            linkPostBlog: post,
        },
    };

    const expectedUnlink = {
        data: {
            unlinkPostBlog: post,
        },
    };

    it('should be able to link', fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
        let actual: any = null;
        tick();
        service.link(post, blog).subscribe(v => actual = v);
        tick();

        expect(actual).toEqual(expectedLink);
    })));

    it('should be able to link in reverse order',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let actual: any = null;
            tick();
            service.link(blog, post).subscribe(v => actual = v);
            tick();

            expect(actual).toEqual(expectedLink);
        })),
    );

    it('should be able to link with extra variables',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let actual: any = null;
            tick();
            service.link(post, blog, null, {isMain: true}).subscribe(v => actual = v);
            tick();

            expect(actual).toEqual(expectedLink);
        })));

    it('should be able to unlink', fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
        let actual: any = null;
        tick();
        service.unlink(post, blog).subscribe(v => actual = v);
        tick();

        expect(actual).toEqual(expectedUnlink);
    })));

    it('should be able to unlink in reverse order',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let actual: any = null;
            tick();
            service.unlink(blog, post).subscribe(v => actual = v);
            tick();

            expect(actual).toEqual(expectedUnlink);
        })));

    it('should throw for non-existing link mutation',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let error: any = null;
            tick();
            service.link(post, nonExisting).subscribe(() => null, (e) => error = e);
            tick();

            expect(error).not.toBeNull();
            expect(error.message).toEqual('API does not allow to link Post and NonExisting');
        })));

    it('should throw for non-existing unlink mutation',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let error: any = null;
            tick();
            service.unlink(post, nonExisting).subscribe(() => null, (e) => error = e);
            tick();

            expect(error).not.toBeNull();
            expect(error.message).toEqual('API does not allow to unlink Post and NonExisting');
        })));

    // TODO: Unfortunately we don't have a model that allow use to easily test semantic linking
    // TODO: This should be restored if/when we a model that allow it again, or it should be ported to OKpilot
    const category1 = {id: '456', __typename: 'Category'};
    const category2 = {id: '789', __typename: 'Category'};
    const expectedCategoryLink = {
        data: {
            linkCategoryParent: category1,
        },
    };

    it('should be able to link with specific semantic',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let actual: any = null;
            tick();
            service.link(category1, category2, 'parent').subscribe(v => actual = v);
            tick();
            expect(actual).toEqual(expectedCategoryLink);
        })),
    );

    it('should be able to link with specific semantic in reverse order and have different result',
        fakeAsync(inject([NaturalLinkMutationService], (service: NaturalLinkMutationService) => {
            let actual: any = null;
            tick();
            service.link(category2, category1, 'parent').subscribe(v => actual = v);
            tick();
            expect(actual).toEqual(expectedCategoryLink);
        })),
    );
});
