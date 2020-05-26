import {NaturalMemoryStorage} from './memory-storage';

describe('NaturalMemoryStorage', () => {
    let storage: NaturalMemoryStorage;

    beforeEach(() => {
        storage = new NaturalMemoryStorage();
    });

    it('.length returns the number of keys', () => {
        expect(storage.length).toBe(0);
        storage.setItem('1', '1');
        expect(storage.length).toBe(1);
        storage.setItem('2', '2');
        expect(storage.length).toBe(2);
    });

    it('#key(n) returns the nth key', () => {
        storage.setItem('1', '1');
        expect(storage.key(0)).toBe('1');
        expect(storage.key(1)).toBeNull();
    });

    it('#setItem(key, value) sets an item that can be retrieved by #getItem(key)', () => {
        storage.setItem('1', 'foobar');
        expect(storage.getItem('1')).toBe('foobar');
    });

    it('#getItem(key) returns null if key does not exist', () => {
        expect(storage.getItem('1')).toBeNull();
    });

    it('#clear() deletes all items', () => {
        storage.setItem('1', 'foobar');
        storage.clear();
        expect(storage.getItem('1')).toBeNull();
    });

    it('#removeItem(key) deletes the item for that key', () => {
        storage.setItem('1', 'foobar');
        storage.removeItem('1');
        expect(storage.getItem('1')).toBeNull();
    });

    it('empty key works', () => {
        storage.setItem('', 'foobar');
        expect(storage.getItem('')).toBe('foobar');
        expect(storage.key(0)).toBe('');
    });
});
