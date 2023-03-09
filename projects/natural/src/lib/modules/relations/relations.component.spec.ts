import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalLinkMutationService, NaturalRelationsComponent, NaturalRelationsModule} from '@ecodev/natural';
import {ItemService} from '../../testing/item.service';
import {MockApolloProvider} from '../../testing/mock-apollo.provider';
import {of} from 'rxjs';

describe('NaturalRelationsComponent', () => {
    let component: NaturalRelationsComponent<ItemService>;
    let fixture: ComponentFixture<NaturalRelationsComponent<ItemService>>;
    let spy: jasmine.Spy<NaturalLinkMutationService['link']>;
    const main = {__typename: 'Main', id: '123'} as const;
    const relation = {__typename: 'Relation', id: '456'} as const;
    const otherName = 'my-other-name';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [MockApolloProvider],
            imports: [NaturalRelationsModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalRelationsComponent<ItemService>);
        component = fixture.componentInstance;
        component.main = main;
        component.otherName = otherName;

        fixture.detectChanges();

        spy = spyOn(TestBed.inject(NaturalLinkMutationService), 'link').and.callFake(() => of(null as any));
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should link if adding relation', done => {
        component.selectionChange.subscribe(() => {
            expect(spy).toHaveBeenCalledOnceWith(main, relation, otherName);
            done();
        });
        component.addRelations([relation]);
    });

    it('should do nothing if adding null relations', done => {
        component.selectionChange.subscribe(() => {
            expect(spy).not.toHaveBeenCalled();
            done();
        });
        component.addRelations([null]);
    });
});
