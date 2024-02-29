import {Apollo, gql} from 'apollo-angular';
import {FetchResult} from '@apollo/client/core';
import {Injectable} from '@angular/core';
import {clone} from 'lodash-es';
import {forkJoin, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Literal} from '../types/types';
import {upperCaseFirstLetter} from '../classes/utility';

/**
 * Query to get list of mutations
 */
const queriesQuery = gql`
    query Mutations {
        __type(name: "Mutation") {
            fields {
                name
                args {
                    name
                    type {
                        ofType {
                            name
                        }
                    }
                }
            }
        }
    }
`;

type IntrospectedArg = {
    name: string;
    type: {
        ofType: null | {
            name: null | string;
        };
    };
};

type IntrospectedMutations = {
    __type: null | {
        fields:
            | null
            | {
                  name: string;
                  args: IntrospectedArg[];
              }[];
    };
};

export type LinkableObject = {
    id: string;
    __typename: string;
};

type MutationArg = {
    name: string;
    type: string;
};

type Mutation = {
    name: string;
    arg1: MutationArg;
    arg2: MutationArg;
};

@Injectable({
    providedIn: 'root',
})
export class NaturalLinkMutationService {
    /**
     * Receives the list of available mutations
     */
    private allMutations?: Mutation[];

    public constructor(private readonly apollo: Apollo) {}

    /**
     * Link two objects together
     */
    public link(
        obj1: LinkableObject,
        obj2: LinkableObject,
        otherName: string | null = null,
        variables: Literal = {},
    ): Observable<FetchResult<{id: string}>> {
        // clone prevents to affect the original reference
        const clonedVariables = clone(variables);

        return this.getMutation('link', obj1, obj2, otherName, clonedVariables).pipe(
            switchMap(mutation => this.execute(mutation)),
        );
    }

    /**
     * Link many objects
     */
    public linkMany(
        obj1: LinkableObject,
        objects: LinkableObject[],
        otherName: string | null = null,
        variables: Literal = {},
    ): Observable<FetchResult<{id: string}>[]> {
        return forkJoin(objects.map(obj2 => this.link(obj1, obj2, otherName, variables)));
    }

    /**
     * Unlink two objects
     */
    public unlink(
        obj1: LinkableObject,
        obj2: LinkableObject,
        otherName: string | null = null,
    ): Observable<FetchResult<{id: string}>> {
        return this.getMutation('unlink', obj1, obj2, otherName).pipe(switchMap(mutation => this.execute(mutation)));
    }

    /**
     * Return the list of all available mutation names
     */
    private getAllMutationNames(): Observable<Mutation[]> {
        if (this.allMutations) {
            return of(this.allMutations);
        }

        const mapArg = (arg: IntrospectedArg): MutationArg => {
            return {
                name: arg.name,
                type: arg.type?.ofType?.name?.replace(/ID$/, '') || 'should-never-happen',
            };
        };

        return this.apollo
            .query<IntrospectedMutations>({
                query: queriesQuery,
                fetchPolicy: 'cache-first',
            })
            .pipe(
                map(({data}) => {
                    if (data.__type?.fields) {
                        this.allMutations = data.__type.fields
                            .filter(v => v.name.match(/^(link|unlink)/))
                            .map(v => {
                                return {
                                    name: v.name,
                                    arg1: mapArg(v.args[0]),
                                    arg2: mapArg(v.args[1]),
                                };
                            });
                    } else {
                        this.allMutations = [];
                    }

                    return this.allMutations;
                }),
            );
    }

    /**
     * Generate mutation using patterns and replacing variables
     */
    private getMutation(
        action: string,
        obj1: LinkableObject,
        obj2: LinkableObject,
        otherName: string | null,
        variables: Literal = {},
    ): Observable<string> {
        otherName = otherName ? upperCaseFirstLetter(otherName) : otherName;
        const mutationName = action + obj1.__typename + (otherName || obj2.__typename);
        const reversedMutationName = action + obj2.__typename + (otherName || obj1.__typename);

        return this.getAllMutationNames().pipe(
            map(allMutationNames => {
                const mutation =
                    allMutationNames.find(mut => mut.name === mutationName) ||
                    allMutationNames.find(mut => mut.name === reversedMutationName);

                if (mutation) {
                    return this.buildTemplate(mutation, obj1, obj2, variables);
                }

                throw TypeError('API does not allow to ' + action + ' ' + obj1.__typename + ' and ' + obj2.__typename);
            }),
        );
    }

    /**
     * Execute mutation
     */
    private execute(mutation: string): Observable<FetchResult<{id: string}>> {
        return this.apollo
            .mutate<{id: string}>({
                mutation: gql(mutation),
            })
            .pipe(
                map(r => {
                    this.apollo.client.reFetchObservableQueries();
                    return r;
                }),
            );
    }

    /**
     * Build the actual mutation string
     */
    private buildTemplate(
        mutation: Mutation,
        obj1: LinkableObject,
        obj2: LinkableObject,
        variables: Literal = {},
    ): string {
        let name1;
        let name2;
        if (obj1.__typename === mutation.arg1.type) {
            name1 = mutation.arg1.name;
            name2 = mutation.arg2.name;
        } else {
            name1 = mutation.arg2.name;
            name2 = mutation.arg1.name;
        }
        variables[name1] = obj1.id;
        variables[name2] = obj2.id;

        let serializedVariables = '';
        for (const key of Object.keys(variables)) {
            serializedVariables += key + ': ' + JSON.stringify(variables[key]) + ' ';
        }

        return `mutation linkAndUnlink {
            ${mutation.name}(${serializedVariables}) {
                id
            }
        }`;
    }
}
