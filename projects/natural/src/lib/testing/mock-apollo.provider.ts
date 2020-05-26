import {Injectable, NgZone, Provider} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';
import {SchemaLink} from 'apollo-link-schema';
import {buildSchema} from 'graphql';
import gql from 'graphql-tag';
import {addMockFunctionsToSchema} from 'graphql-tools';

export const postsQuery = gql`
    query Posts($filter: PostFilter, $sorting: [String!], $pagination: PaginationInput) {
        posts(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                slug
                creationDate
                updateDate
            }
            pageSize
            pageIndex
            length
        }
    }
`;

export const postQuery = gql`
    query Post($id: ID!) {
        post(id: $id) {
            id
            slug
            creationDate
            updateDate
            blog {
                id
            }
        }
    }
`;

export const updatePost = gql`
    mutation UpdatePost($id: ID!, $input: PostPartialInput!) {
        updatePost(id: $id, input: $input) {
            id
            slug
            updateDate
        }
    }
`;

export const createPost = gql`
    mutation CreatePost($input: PostInput!) {
        createPost(input: $input) {
            id
            slug
            creationDate
        }
    }
`;

export const deletePosts = gql`
    mutation DeletePosts($ids: [ID!]!) {
        deletePosts(ids: $ids)
    }
`;

const typeDefs = `
    type Query {
        hello: String
        posts (
            filter: PostFilter,
            sorting: [String!],
            pagination: PaginationInput
        ): PostPagination!
        post(id: ID!): Post!
    }

    type PostPagination {
        pageIndex: Int!
        pageSize: Int!
        length: Int!
        items: [Post!]!
    }

    type Mutation {
        linkPostBlog(post: ID!, blog: ID!): Post!
        unlinkPostBlog(post: ID!, blog: ID!): Post!
        linkCategoryParent(category: ID!, parent: ID!): Category!
        unlinkCategoryParent(category: ID!, parent: ID!): Category!
        createPost(input: PostInput!): Post!
        updatePost(id: ID!, input: PostPartialInput!): Post!
        deletePosts(ids: [ID!]!): Boolean!
    }

    input PostInput {
        slug: String!
        blog: ID!
    }

    input PostPartialInput {
        slug: String
        blog: ID
    }

    input PaginationInput {
        pageIndex: Int = 0
        pageSize: Int = 50
    }

    input PostFilter {
        search: String
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
        creationDate: String!
        updateDate: String!
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
export const MockApolloProvider: Provider = {
    provide: Apollo,
    useClass: MockApollo,
};
