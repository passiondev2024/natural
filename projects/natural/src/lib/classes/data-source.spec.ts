import {NaturalDataSource, PaginatedData} from './data-source';
import {Subject} from 'rxjs';

interface Model {
    a: string;
}

describe('DataSource', () => {
    let dataSource: NaturalDataSource<PaginatedData<Model>>;
    let dataSourceWithScalar: NaturalDataSource<PaginatedData<Model>>;
    let subject: Subject<PaginatedData<Model>>;
    let data: PaginatedData<Model>;

    beforeEach(() => {
        data = {
            items: [{a: 'foo'}, {a: 'bar'}],
            pageSize: 25,
            pageIndex: 0,
            offset: 0,
            length: 2,
        };
        subject = new Subject<PaginatedData<Model>>();
        dataSource = new NaturalDataSource<PaginatedData<Model>>(subject);
        dataSourceWithScalar = new NaturalDataSource<PaginatedData<Model>>(data);
    });

    it('with observable', () => {
        expect(dataSource.data).toBeNull('initial state should be null, so we can show loading indicator to end-user');

        const item = dataSource.pop();
        expect(item).toBeUndefined('pop() without data has no effect');
        expect(dataSource.data).toBeNull('pop() without data has no effect');

        dataSource.push({a: 'baz'});
        expect(dataSource.data).toBeNull('push() without data has no effect');

        dataSource.remove({a: 'baz'});
        expect(dataSource.data).toBeNull('remove() without data has no effect');

        subject.next(data);
        expect(dataSource.data).toBe(data, 'data should be propagated');

        testDataMutations(dataSource);
    });

    it('with scalars', () => {
        expect(dataSourceWithScalar.data).toBe(data, 'initial state is immediately the original data');

        testDataMutations(dataSourceWithScalar);
    });
});

function testDataMutations(dataSource: NaturalDataSource<PaginatedData<Model>>): void {
    const newItem = {a: 'newItem'};

    dataSource.push(newItem);
    expect(dataSource.data).toEqual(
        {
            items: [{a: 'foo'}, {a: 'bar'}, newItem],
            pageSize: 25,
            pageIndex: 0,
            offset: 0,
            length: 3,
        },
        'push() a the end of data',
    );

    dataSource.remove(newItem);
    expect(dataSource.data).toEqual(
        {
            items: [{a: 'foo'}, {a: 'bar'}],
            pageSize: 25,
            pageIndex: 0,
            offset: 0,
            length: 2,
        },
        'remove() item from data',
    );
}
