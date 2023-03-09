import {TestBed} from '@angular/core/testing';
import {MockApolloProvider} from '../testing/mock-apollo.provider';
import {ItemService, Item} from '../testing/item.service';
import {NaturalAbstractEditableList} from '@ecodev/natural';
import {RouterTestingModule} from '@angular/router/testing';
import {Directive} from '@angular/core';

@Directive()
class EditableList extends NaturalAbstractEditableList<ItemService> {}

describe('NaturalAbstractEditableList', () => {
    let list: EditableList;
    let service: ItemService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockApolloProvider],
            imports: [RouterTestingModule],
        });

        service = TestBed.inject(ItemService);
        list = new EditableList(service);
    });

    it('should be created', () => {
        expect(list).toBeTruthy();
    });

    it('should have consistent default values', () => {
        expect(list.form).withContext('have a form').toBeTruthy();
        expect(list.formArray).withContext('have a formArray').toBeTruthy();
        expect(list.getItems()).withContext('no items at all').toEqual([]);
        expect(list.dataSource.data).withContext('no controls at all').toEqual([]);
        expect(list.variablesManager.variables.value)
            .withContext('forced huge pagination')
            .toEqual({
                pagination: {
                    pageSize: 999,
                    pageIndex: 0,
                },
            });
    });

    it('should be able to set, add and remove items', () => {
        // Pre-fill with something that will get overwritten
        list.addItems([service.getItem()]);
        expect(list.formArray.length).toBe(1);
        expect(list.dataSource.data.length).toBe(1);
        expect(list.getItems()).toEqual([
            {id: '1', name: 'name-1', description: 'description-1', children: [], parent: null} as unknown as Item,
        ]);

        list.setItems([service.getItem(), {} as Item]);
        expect(list.formArray.length).toBe(2);
        expect(list.dataSource.data.length).toBe(2);
        expect(list.getItems())
            .withContext('first item should be untouched, second item should have been completed with default values')
            .toEqual([
                {id: '2', name: 'name-2', description: 'description-2', children: [], parent: null},
                {name: '', description: '', children: [], parent: null} as any,
            ]);

        list.removeAt(0);
        expect(list.formArray.length).toBe(1);
        expect(list.dataSource.data.length).toBe(1);
        expect(list.getItems())
            .withContext('only second item left')
            .toEqual([{name: '', description: '', children: [], parent: null} as any]);

        list.addItems([service.getItem()]);
        expect(list.formArray.length).toBe(2);
        expect(list.dataSource.data.length).toBe(2);
        expect(list.getItems()).toEqual([
            {name: '', description: '', children: [], parent: null} as any,
            {id: '3', name: 'name-3', description: 'description-3', children: [], parent: null},
        ]);
    });

    it('should add empty', () => {
        list.addEmpty();
        expect(list.formArray.length).toBe(1);
        expect(list.dataSource.data.length).toBe(1);
        expect(list.getItems()).toEqual([{name: '', description: '', children: [], parent: null} as any]);
    });

    it('should validate form', () => {
        expect(list.form.valid).withContext('valid because no controls at all').toBe(true);

        list.addEmpty();
        expect(list.form.valid)
            .withContext('invalid because some required fields have empty default value')
            .toBe(false);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        list.formArray.at(0).get('name')!.setValue('foo');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        list.formArray.at(0).get('description')!.setValue('foo');

        expect(list.form.valid).withContext('valid because required field are non-empty').toBe(true);
    });
});
