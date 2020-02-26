import { TestBed } from '@angular/core/testing';
import { QueryVariables } from '../classes/query-variable-manager';
import { MockApolloProvider } from '../testing/mock-apollo.provider';
import { AnyService, Item } from '../testing/any.service';
import { NaturalAbstractEditableList } from '@ecodev/natural';
import { RouterTestingModule } from '@angular/router/testing';

class EditableList extends NaturalAbstractEditableList<Item, QueryVariables> {

}

describe('NaturalAbstractEditableList', () => {
    let list: EditableList;
    let service: AnyService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockApolloProvider,
            ],
            imports: [
                RouterTestingModule,
            ],
        });

        service = TestBed.inject(AnyService);
        list = new EditableList(service);
    });

    it('should be created', () => {
        expect(list).toBeTruthy();
    });

    it('should have consistent default values', () => {
        expect(list.form).toBeTruthy('have a form');
        expect(list.formArray).toBeTruthy('have a formArray');
        expect(list.getItems()).toEqual([], 'no items at all');
        expect(list.dataSource.data).toEqual([], 'no controls at all');
        expect(list.variablesManager.variables.value).toEqual({
            pagination: {
                pageSize: 999,
                pageIndex: 0,
            },
        }, 'forced huge pagination');
    });

    it('should be able to set, add and remove items', () => {
        // Pre-fill with something that will get overwritten
        list.addItems([service.getItem()]);
        expect(list.formArray.length).toBe(1);
        expect(list.dataSource.data.length).toBe(1);
        expect(list.getItems()).toEqual([
                {id: '1', name: 'name-1', description: 'description-1', children: [], parent: null},
            ],
        );

        list.setItems([service.getItem(), {} as Item]);
        expect(list.formArray.length).toBe(2);
        expect(list.dataSource.data.length).toBe(2);
        expect(list.getItems()).toEqual([
                {id: '2', name: 'name-2', description: 'description-2', children: [], parent: null},
                {name: '', description: '', children: [], parent: null} as any,
            ],
            'first item should be untouched, second item should have been completed with default values',
        );

        list.removeAt(0);
        expect(list.formArray.length).toBe(1);
        expect(list.dataSource.data.length).toBe(1);
        expect(list.getItems()).toEqual([
                {name: '', description: '', children: [], parent: null} as any,
            ],
            'only second item left',
        );

        list.addItems([service.getItem()]);
        expect(list.formArray.length).toBe(2);
        expect(list.dataSource.data.length).toBe(2);
        expect(list.getItems()).toEqual([
                {name: '', description: '', children: [], parent: null} as any,
                {id: '3', name: 'name-3', description: 'description-3', children: [], parent: null},
            ],
        );
    });

    it('should add empty', () => {
        list.addEmpty();
        expect(list.formArray.length).toBe(1);
        expect(list.dataSource.data.length).toBe(1);
        expect(list.getItems()).toEqual([
                {name: '', description: '', children: [], parent: null} as any,
            ],
        );
    });

    it('should validate form', () => {
        expect(list.form.valid).toBe(true, 'valid because no controls at all');

        list.addEmpty();
        expect(list.form.valid).toBe(false, 'invalid because some required fields have empty default value');

        // tslint:disable-next-line:no-non-null-assertion
        list.formArray.at(0).get('name')!.setValue('foo');

        // tslint:disable-next-line:no-non-null-assertion
        list.formArray.at(0).get('description')!.setValue('foo');

        expect(list.form.valid).toBe(true, 'valid because required field are non-empty');
    });

});

