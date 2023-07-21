import {graphqlQuerySigner} from './signing';
import {HttpHandlerFn, HttpRequest, HttpResponse} from '@angular/common/http';
import {of} from 'rxjs';

const graphqlQuery = {
    operationName: 'CurrentUser',
    variables: {},
    query: 'query CurrentUser { viewer { id }}',
};

const batchedGraphqlQuery = [
    graphqlQuery,
    {
        operationName: 'Configuration',
        variables: {key: 'announcement-active'},
        query: 'query Configuration($key: String!) {\n  configuration(key: $key)\n}',
    },
];

const key = 'my-secret-1';

function expectSigned(request: HttpRequest<unknown>, done: DoneFn): void {
    const signer = graphqlQuerySigner(key);

    const handler = jasmine.createSpy<HttpHandlerFn>('HttpHandlerFn');
    handler.and.callFake(() => of(new HttpResponse()));

    signer(request, handler).subscribe(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        const sentRequest = handler.calls.first().args[0];
        expect(sentRequest.headers.get('Authorization')).toMatch(/^v1\.\d{10}\.[0-9a-f]{64}$/);
        done();
    });
}

function expectNotSigned(request: HttpRequest<unknown>, done: DoneFn): void {
    const signer = graphqlQuerySigner(key);

    const handler = jasmine.createSpy<HttpHandlerFn>('HttpHandlerFn');
    handler.and.callFake(() => of(new HttpResponse()));

    signer(request, handler).subscribe(() => {
        expect(handler).toHaveBeenCalledOnceWith(request);
        expect(request.headers.has('Authorization')).toBeFalse();
        done();
    });
}

describe('graphqlQuerySigner', () => {
    it('sign a normal query', done => {
        const request = new HttpRequest('POST', '/graphql', graphqlQuery);

        expectSigned(request, done);
    });

    it('sign a batched query', done => {
        const request = new HttpRequest('POST', '/graphql', batchedGraphqlQuery);

        expectSigned(request, done);
    });

    it('sign an upload query', done => {
        const createImage =
            '{"operationName":"CreateImage","variables":{"input":{"file":null}},"query":"mutation CreateImage($input: ImageInput!) { createImage(input: $input) { id }}"}';

        const data = new FormData();
        data.set('operations', createImage);
        data.set('map', '{"1":["variables.input.file"]}');
        data.set('1', new File([], 'image.jpg'));

        const request = new HttpRequest('POST', '/graphql', data);

        expectSigned(request, done);
    });

    it('do not sign other URL', done => {
        const request = new HttpRequest('POST', '/api', graphqlQuery);

        expectNotSigned(request, done);
    });

    it('do not sign other methods', done => {
        const request = new HttpRequest('GET', '/graphql', graphqlQuery);

        expectNotSigned(request, done);
    });
});
