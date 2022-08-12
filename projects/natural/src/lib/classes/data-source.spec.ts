import {NaturalDataSource, PaginatedData} from './data-source';
import {Subject} from 'rxjs';
import {deepFreeze} from '@ecodev/natural';

interface Model {
    a: string;
}

describe('DataSource', () => {
    let dataSource: NaturalDataSource<PaginatedData<Model>>;
    let dataSourceWithScalar: NaturalDataSource<PaginatedData<Model>>;
    let subject: Subject<PaginatedData<Model>>;
    let data: PaginatedData<Model>;

    beforeEach(() => {
        data = deepFreeze({
            items: [{a: 'foo'}, {a: 'bar'}],
            pageSize: 25,
            pageIndex: 0,
            offset: 0,
            length: 2,
        });
        subject = new Subject<PaginatedData<Model>>();
        dataSource = new NaturalDataSource<PaginatedData<Model>>(subject);
        dataSourceWithScalar = new NaturalDataSource<PaginatedData<Model>>(data);
    });

    it('with observable', () => {
        expect(dataSource.data)
            .withContext('initial state should be null, so we can show loading indicator to end-user')
            .toBeNull();

        const item = dataSource.pop();
        expect(item).withContext('pop() without data has no effect').toBeUndefined();
        expect(dataSource.data).withContext('pop() without data has no effect').toBeNull();

        dataSource.push({a: 'baz'});
        expect(dataSource.data).withContext('push() without data has no effect').toBeNull();

        dataSource.remove({a: 'baz'});
        expect(dataSource.data).withContext('remove() without data has no effect').toBeNull();

        subject.next(data);
        expect(dataSource.data).withContext('data should be propagated').toBe(data);

        testDataMutations(dataSource);
    });

    it('with scalars', () => {
        expect(dataSourceWithScalar.data).withContext('initial state is immediately the original data').toBe(data);

        testDataMutations(dataSourceWithScalar);
    });
});

function testDataMutations(dataSource: NaturalDataSource<PaginatedData<Model>>): void {
    const newItem = {a: 'newItem'};

    dataSource.push(newItem);
    expect(dataSource.data)
        .withContext('push() a the end of data')
        .toEqual({
            items: [{a: 'foo'}, {a: 'bar'}, newItem],
            pageSize: 25,
            pageIndex: 0,
            offset: 0,
            length: 3,
        });

    dataSource.remove(newItem);
    expect(dataSource.data)
        .withContext('remove() item from data')
        .toEqual({
            items: [{a: 'foo'}, {a: 'bar'}],
            pageSize: 25,
            pageIndex: 0,
            offset: 0,
            length: 2,
        });
}
