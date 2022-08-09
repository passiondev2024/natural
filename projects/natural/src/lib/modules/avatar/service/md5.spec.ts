import {md5} from './md5';

describe('md5', () => {
    it('should hash', () => {
        expect(md5('foo')).toBe('acbd18db4cc2f85cedef654fccc4a4d8');
        expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
        expect(md5('räksmörgås')).toBe('e462805dcf84413d5eddca45a4b88a5e');
        expect(md5('\u30b9\u3092\u98df')).toBe('453931ab48a4a5af69f3da3c21064fc9');
    });
});
