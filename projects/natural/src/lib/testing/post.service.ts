import { Injectable } from '@angular/core';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { Apollo } from 'apollo-angular';
import { createPost, deletePosts, postQuery, postsQuery, updatePost } from './mock-apollo.provider';

@Injectable({
    providedIn: 'root',
})
export class PostService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any> {

    constructor(apollo: Apollo) {
        super(apollo,
            'post',
            postQuery,
            postsQuery,
            createPost,
            updatePost,
            deletePosts);
    }

    protected getDefaultForServer(): any['input'] {
        return {
            slug: '',
            blog: null,
        };
    }
}
