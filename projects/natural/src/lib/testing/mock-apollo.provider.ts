import { Injectable, NgZone } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { addMockFunctionsToSchema } from 'graphql-tools';
import { buildSchema } from 'graphql';
import gql from 'graphql-tag';

const typeDefs = `
    type Query {
        hello: String
    }

    type Mutation {
        linkPostBlog(post: ID!, blog: ID!): Post!
        unlinkPostBlog(post: ID!, blog: ID!): Post!
        linkCategoryParent(category: ID!, parent: ID!): Category!
        unlinkCategoryParent(category: ID!, parent: ID!): Category!
    }

    enum MyEnum {
        """Description 1"""
        value1

        """Description 2"""
        value2
    }

    type Blog {
        id: ID!
    }

    type Post {
        id: ID!
        slug: String
        blog: Blog
    }

    type Category {
        id: ID!
        parent: Category
    }
`;

/**
 * A mock Apollo to be used in tests only
 */
@Injectable({
    providedIn: 'root',
})
class MockApollo extends Apollo {
    constructor(ngZone: NgZone) {
        super(ngZone);
        const mockClient = this.createMockClient();
        super.setClient(mockClient);
    }

    /**
     * This will create a fake ApolloClient who can responds to queries
     * against our real schema with random values
     */
    private createMockClient() {

        // Configure hardcoded mocked values on a type basis.
        // That means all data will look be very similar, but at least
        // tests are robust and won't change if/when random generators
        // would be used differently
        const mocks = {
            ID: () => '456',
            Int: () => 1,
            Float: () => 0.5,
            String: () => 'test string',
            Boolean: () => true,
        };
        const schema = buildSchema(typeDefs);

        addMockFunctionsToSchema({schema, mocks});

        const apolloCache = new InMemoryCache((window as any).__APOLLO_STATE__);

        return new ApolloClient({
            cache: apolloCache,
            link: new SchemaLink({schema}),
        });
    }
}

/**
 * This is the only way to use our MockApollo
 */
export const MockApolloProvider = {
    provide: Apollo,
    useClass: MockApollo,
};
