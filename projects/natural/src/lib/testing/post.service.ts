import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';

import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {createPost, deletePosts, Post, PostInput, postQuery, postsQuery, updatePost} from './mock-apollo.provider';
import {Literal, PaginatedData, QueryVariables} from '@ecodev/natural';
import {NaturalDebounceService} from '../services/debounce.service';

@Injectable({
    providedIn: 'root',
})
export class PostService extends NaturalAbstractModelService<
    Post,
    {id: string},
    PaginatedData<Post>,
    QueryVariables,
    Post | null,
    {input: PostInput},
    Post,
    {id: string; input: Literal},
    boolean,
    {ids: string[]}
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'post', postQuery, postsQuery, createPost, updatePost, deletePosts);
    }

    protected override getDefaultForServer(): PostInput {
        return {
            slug: '',
            blog: '',
        };
    }
}
