import {ensureHttpPrefix} from '@ecodev/natural';

describe('ensureHttpPrefix', () => {
    it('should add http prefix', () => {
        expect(ensureHttpPrefix(null)).toBeNull();
        expect(ensureHttpPrefix('')).toEqual('');
        expect(ensureHttpPrefix('h')).toEqual('h');
        expect(ensureHttpPrefix('ht')).toEqual('ht');
        expect(ensureHttpPrefix('htt')).toEqual('htt');
        expect(ensureHttpPrefix('http')).toEqual('http');
        expect(ensureHttpPrefix('https')).toEqual('https');
        expect(ensureHttpPrefix('https:')).toEqual('https:');
        expect(ensureHttpPrefix('https:/')).toEqual('https:/');
        expect(ensureHttpPrefix('https://')).toEqual('https://');
        expect(ensureHttpPrefix('https://ww')).toEqual('https://ww');
        expect(ensureHttpPrefix('https://www.example.com')).toEqual('https://www.example.com');

        expect(ensureHttpPrefix('http')).toEqual('http');
        expect(ensureHttpPrefix('http:')).toEqual('http:');
        expect(ensureHttpPrefix('http:/')).toEqual('http:/');
        expect(ensureHttpPrefix('http://')).toEqual('http://');
        expect(ensureHttpPrefix('http://ww')).toEqual('http://ww');
        expect(ensureHttpPrefix('http://www.example.com')).toEqual('http://www.example.com');

        expect(ensureHttpPrefix('www.example.com')).toEqual('http://www.example.com');
    });
});
