import {acceptType} from './utils';

describe('acceptType', () => {
    it('accept anything', () => {
        expect(acceptType('', 'image/jpeg', 'foo.jpg')).toBe(true);
        expect(acceptType(' ', 'image/jpeg', 'foo.jpg')).toBe(true);
    });

    it('.png,.jpg,.gif', () => {
        const accept = '.png,.jpg,.gif';
        expect(acceptType(accept, 'text/comma-separated-values', 'foo.csv')).toBe(false);
        expect(acceptType(accept, 'image/jpeg', 'foo.jpg')).toBe(true);
        expect(acceptType(accept, 'image/gif', 'foo.gif')).toBe(true);
        expect(acceptType(accept, 'image/png', 'foo.png')).toBe(true);
    });

    it('.mp4,video/*', () => {
        const accept = '.mp4,video/*';
        expect(acceptType(accept, 'mp4/video', 'foo.avi')).toBe(false);
        expect(acceptType(accept, 'audio/mp4', 'foo.avi')).toBe(false);
        expect(acceptType(accept, 'video/mp4', 'foo.avi')).toBe(true);
        expect(acceptType(accept, 'audio/mp4', 'foo.mp4')).toBe(true);
        expect(acceptType(accept, 'video/mp4', 'foo.mp4')).toBe(true);
        expect(acceptType(accept, '', 'foo.mp4')).toBe(true);
    });

    it('extension test', () => {
        const accept = '.pdf, .jpg, .tif, .gif, .bmp, .jpeg';
        expect(acceptType(accept, 'image/gif', 'foo.gif')).toBe(true);
        expect(acceptType(accept, 'application/pdf', 'foo.pdf')).toBe(true);
        expect(acceptType(accept, 'image/bmp', 'foo.bmp')).toBe(true);
        expect(acceptType(accept, '', 'foo.gif.xyx')).toBe(false);
        expect(acceptType(accept, 'video/mp4', 'foo.mp4')).toBe(false);
        expect(acceptType(accept, '', 'foo.mp4')).toBe(false);
    });
});
