import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {createPost, Post, PostInput} from './mock-apollo.provider';
import {NaturalDebounceService} from '../services/debounce.service';

/**
 * A service that returns `null` on creation, for testing purpose
 */
@Injectable({
    providedIn: 'root',
})
export class NullService extends NaturalAbstractModelService<
    never,
    never,
    never,
    never,
    Post | null,
    {input: PostInput},
    never,
    never,
    never,
    never
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'user', null, null, createPost, null, null);
    }

    public override getDefaultForServer(): PostInput {
        return {
            slug: '',
            blog: '',
        };
    }

    protected override mapCreation(): Post | null {
        return null;
    }
}
