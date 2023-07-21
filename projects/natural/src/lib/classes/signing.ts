import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {HmacSHA256} from 'crypto-es/lib/sha256';

function getOperations(req: HttpRequest<unknown>): string {
    if (req.body instanceof FormData) {
        const operations = req.body.get('operations');
        if (typeof operations !== 'string') {
            throw new Error(
                'Cannot sign a GraphQL query that is using FormData but that is missing the key `operations`',
            );
        }
        return operations;
    } else {
        return JSON.stringify(req.body);
    }
}

/**
 * Sign all HTTP POST requests that are GraphQL queries against `/graphql` endpoint with a custom signature.
 *
 * The server will validate the signature before executing the GraphQL query.
 */
export function graphqlQuerySigner(key: string): HttpInterceptorFn {
    return (req, next) => {
        const mustSign = req.method === 'POST' && req.url.match(/\/graphql(\?|$)/);
        if (!mustSign) {
            return next(req);
        }

        const operations = getOperations(req);
        const timestamp = Math.round(Date.now() / 1000);
        const payload = timestamp + operations;
        const hash = HmacSHA256(payload, key).toString();
        const header = `v1.${timestamp}.${hash}`;

        const signedRequest = req.clone({
            headers: req.headers.set('Authorization', header),
        });

        return next(signedRequest);
    };
}
