import {NaturalQueryVariablesManager} from './query-variable-manager';

describe('QueryVariablesManager', () => {
    let manager: NaturalQueryVariablesManager<any>;

    beforeEach(() => {
        manager = new NaturalQueryVariablesManager<any>();
        expect(manager.variables.value).toBeUndefined();
    });

    it('should merge flat objects as lodash does in same channel', () => {
        manager.merge('a', {a: 1});
        expect(manager.variables.value).toEqual({a: 1});

        manager.merge('a', {a: 2});
        expect(manager.variables.value).toEqual({a: 2});

        manager.merge('a', {b: 3});
        expect(manager.variables.value).toEqual({a: 2, b: 3});

        manager.merge('a', {b: 4});
        expect(manager.variables.value).toEqual({a: 2, b: 4});
    });

    it('should merge nested objects as lodash does in same channel', () => {
        manager.merge('a', {a: 1});
        expect(manager.variables.value).toEqual({a: 1});

        manager.merge('a', {a: {aa: 11}});
        expect(manager.variables.value).toEqual({a: {aa: 11}});

        manager.merge('a', {a: {aa: 12}});
        expect(manager.variables.value).toEqual({a: {aa: 12}});

        manager.merge('a', {b: 4});
        expect(manager.variables.value).toEqual({a: {aa: 12}, b: 4});

        manager.merge('a', {a: {b: 13}});
        expect(manager.variables.value).toEqual({a: {aa: 12, b: 13}, b: 4});
    });

    // Same as previous example but always in a different channel
    it('should merge objects as lodash does in multiple channel', () => {
        manager.merge('a', {a: 1});
        expect(manager.variables.value).toEqual({a: 1});

        manager.merge('b', {a: {aa: 11}});
        expect(manager.variables.value).toEqual({a: {aa: 11}});

        manager.merge('c', {a: {aa: 12}});
        expect(manager.variables.value).toEqual({a: {aa: 12}});

        manager.merge('d', {b: 4});
        expect(manager.variables.value).toEqual({
            a: {aa: 12},
            b: 4,
        });

        manager.merge('f', {a: {b: 13}});
        expect(manager.variables.value).toEqual({
            a: {
                aa: 12,
                b: 13,
            },
            b: 4,
        });

        // Update an existing channel
        manager.merge('a', {a: {d: 14}});
        expect(manager.variables.value).toEqual({
            a: {
                aa: 12,
                b: 13,
                d: 14,
            },
            b: 4,
        });
    });

    // Xit because probable deprecation of merge
    it('should override first found array (from the root) in same channel', () => {
        manager.merge('a', {
            myArray: ['a', 'b'],
        });
        expect(manager.variables.value).toEqual({
            myArray: ['a', 'b'],
        });

        manager.merge('a', {
            myArray: ['c', 'd'],
        });
        expect(manager.variables.value).toEqual({
            myArray: ['c', 'd'],
        });

        manager.merge('a', {
            myArray: [{a: 1}, {b: 2}],
        });
        expect(manager.variables.value).toEqual({
            myArray: [{a: 1}, {b: 2}],
        });

        manager.merge('a', {myArray: [{a: 1}]});
        expect(manager.variables.value).toEqual({myArray: [{a: 1}]});

        manager.merge('a', {myArray: []});
        expect(manager.variables.value).toEqual({myArray: []});

        manager.merge('a', {myArray: [{a: {b: 11}}]});
        expect(manager.variables.value).toEqual({myArray: [{a: {b: 11}}]});

        manager.merge('a', {
            myArray: [
                {
                    a: {
                        b: 12,
                        c: 13,
                    },
                },
            ],
        });
        expect(manager.variables.value).toEqual({
            myArray: [
                {
                    a: {
                        b: 12,
                        c: 13,
                    },
                },
            ],
        });

        manager.merge('a', {myArray: [{a: {c: 13}}]});
        expect(manager.variables.value).toEqual({myArray: [{a: {c: 13}}]});
    });

    it('should concat first found array (from the root) in different channels', () => {
        manager.merge('a', {myArray: ['a']});
        expect(manager.variables.value).toEqual({myArray: ['a']});

        manager.merge('b', {myArray: [{a: 1}]});
        expect(manager.variables.value).toEqual({
            myArray: ['a', {a: 1}],
        });

        manager.merge('c', {
            myArray: [
                {
                    b: [11, 12, 13],
                },
            ],
        });

        expect(manager.variables.value).toEqual({
            myArray: [
                'a',
                {a: 1},
                {
                    b: [11, 12, 13],
                },
            ],
        });

        manager.merge('d', {
            myArray: [
                {
                    b: [14, 15, 16],
                },
            ],
        });
        expect(manager.variables.value).toEqual({
            myArray: [
                'a',
                {a: 1},
                {
                    b: [11, 12, 13],
                },
                {
                    b: [14, 15, 16],
                },
            ],
        });
    });

    it('should override conditions in graphql typed query variables in same channel', () => {
        const variablesA = {
            filter: {
                groups: [
                    {
                        conditions: [{a: {equal: 1405}}, {b: {equal: 1605}}],
                    },
                    {
                        conditions: [{c: {equal: 123}}, {d: {equal: 456}}],
                    },
                ],
            },
        };

        const variablesB = {
            filter: {
                groups: [
                    {
                        conditions: [{e: {equal: 1405}}, {f: {equal: 1605}}],
                    },
                    {
                        conditions: [{g: {equal: 123}}, {g: {equal: 456}}],
                    },
                ],
            },
        };

        manager.merge('a', variablesA);
        expect(manager.variables.value).toEqual(variablesA, 'should be first set');

        manager.merge('a', variablesB);
        expect(manager.variables.value).toEqual(variablesB, 'should be second set');
    });

    it('should combine filters without groups', () => {
        const variablesA = {
            filter: {
                a: {equal: 1405},
                b: {in: [1, 2, 3]},
            },
        };

        const variablesB = {
            filter: {
                b: {in: [4, 5, 6]},
                d: {equal: 1605},
            },
        };

        const result = {
            filter: {
                a: {equal: 1405},
                b: {in: [1, 2, 3, 4, 5, 6]},
                d: {equal: 1605},
            },
        };

        manager.set('a', variablesA);
        manager.set('b', variablesB);
        expect(manager.variables.value).toEqual(result);
    });

    it('should concat conditions in graphql typed query variables in different channels', () => {
        const variablesA = {
            filter: {
                groups: [
                    {
                        conditions: [{a: {equal: 1405}}, {b: {equal: 1605}}],
                    },
                    {
                        conditions: [{c: {equal: 123}}, {d: {equal: 456}}],
                    },
                ],
            },
        };

        const variablesB = {
            filter: {
                groups: [
                    {
                        conditions: [{e: {equal: 1405}}, {f: {equal: 1605}}],
                    },
                    {
                        conditions: [{g: {equal: 123}}, {g: {equal: 456}}],
                    },
                ],
            },
        };

        const result = {
            filter: {
                groups: [
                    {
                        conditions: [{a: {equal: 1405}}, {b: {equal: 1605}}, {e: {equal: 1405}}, {f: {equal: 1605}}],
                    },
                    {
                        conditions: [{a: {equal: 1405}}, {b: {equal: 1605}}, {g: {equal: 123}}, {g: {equal: 456}}],
                    },
                    {
                        conditions: [{c: {equal: 123}}, {d: {equal: 456}}, {e: {equal: 1405}}, {f: {equal: 1605}}],
                    },
                    {
                        conditions: [{c: {equal: 123}}, {d: {equal: 456}}, {g: {equal: 123}}, {g: {equal: 456}}],
                    },
                ],
            },
        };

        manager.merge('a', variablesA);
        expect(manager.variables.value).toEqual(variablesA);

        manager.merge('b', variablesB);
        expect(manager.variables.value).toEqual(result);
    });

    it('should contextualize target channel when context is applied after target', () => {
        const varsA = {
            filter: {
                groups: [
                    {
                        conditions: [{x: {equal: 'xxxx'}}, {y: {equal: 'yyyy'}}],
                    },
                ],
            },
        };

        const naturalSearch = {
            filter: {
                groups: [
                    {
                        conditions: [{a: {equal: 1405}}, {b: {equal: 1605}}],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [{c: {equal: 1234}}, {d: {equal: 5678}}],
                    },
                ],
            },
        };

        const result = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                            {x: {equal: 'xxxx'}},
                            {y: {equal: 'yyyy'}},
                        ],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {c: {equal: 1234}},
                            {d: {equal: 5678}},
                            {x: {equal: 'xxxx'}},
                            {y: {equal: 'yyyy'}},
                        ],
                    },
                ],
            },
        };

        manager.set('natural-search', naturalSearch);
        expect(manager.variables.value).toEqual(naturalSearch);

        manager.set('a', varsA);
        expect(manager.variables.value).toEqual(result);
    });

    it('should contextualize target channel when target is applied after context', () => {
        const varsA = {
            filter: {
                groups: [
                    {
                        conditions: [{x: {equal: 'xxxx'}}, {y: {equal: 'yyyy'}}],
                    },
                ],
            },
        };

        const naturalSearch = {
            filter: {
                groups: [
                    {
                        conditions: [{a: {equal: 1405}}, {b: {equal: 1605}}],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [{c: {equal: 1234}}, {d: {equal: 5678}}],
                    },
                ],
            },
        };

        const result = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {x: {equal: 'xxxx'}},
                            {y: {equal: 'yyyy'}},
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                        ],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {x: {equal: 'xxxx'}},
                            {y: {equal: 'yyyy'}},
                            {c: {equal: 1234}},
                            {d: {equal: 5678}},
                        ],
                    },
                ],
            },
        };

        manager.set('a', varsA);
        expect(manager.variables.value).toEqual(varsA);

        manager.set('natural-search', naturalSearch);
        expect(manager.variables.value).toEqual(result);
    });

    it('should contextualize target channel including join and other root keys', () => {
        // Add context with other root variables and conditions and joins
        const vars = {
            state: '123',
            test: {a: 1},
            filter: {
                groups: [
                    {
                        conditions: [{x: {equal: 'xxx'}}],
                        joins: {y: {conditions: [{checklist: {equal: 'yyy'}}]}},
                    },
                ],
            },
        };

        const naturalSearch = {
            filter: {
                groups: [
                    {
                        conditions: [{a: {equal: 1405}}, {b: {equal: 1605}}],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [{c: {equal: 1234}}, {d: {equal: 5678}}],
                    },
                ],
            },
        };

        const result = {
            state: '123',
            test: {a: 1},
            filter: {
                groups: [
                    {
                        conditions: [{x: {equal: 'xxx'}}, {a: {equal: 1405}}, {b: {equal: 1605}}],
                        joins: {y: {conditions: [{checklist: {equal: 'yyy'}}]}},
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [{x: {equal: 'xxx'}}, {c: {equal: 1234}}, {d: {equal: 5678}}],
                        joins: {y: {conditions: [{checklist: {equal: 'yyy'}}]}},
                    },
                ],
            },
        };

        manager.set('a', vars);
        expect(manager.variables.value).toEqual(vars);

        manager.set('natural-search', naturalSearch);
        expect(manager.variables.value).toEqual(result);
    });

    it('should merge context filters with single group in natural search filter with single group', () => {
        const naturalSearchFilter = {
            filter: {
                groups: [{conditions: [{field2: 'qwer'}]}],
            },
        };

        const contextFilter = {
            filter: {
                groups: [{conditions: [{field1: 'asdf'}]}],
            },
        };

        const result = {
            filter: {
                groups: [
                    {
                        conditions: [{field1: 'asdf'}, {field2: 'qwer'}],
                    },
                ],
            },
        };

        manager.set('partial-variables', contextFilter);
        manager.set('natural-search', naturalSearchFilter);
        expect(manager.variables.value).toEqual(result);
    });

    it('should accept filters without groups', () => {
        // List of actors filtered by their character name, called John that have more than 40yo
        const varsA = {
            filter: {
                groups: [{conditions: [{firstName: 'John'}], join: 'asdf'}, {conditions: [{age: {gt: 40}}]}],
            },
        };

        // User wants actors that played Die Hard (3 and 4) or 5
        const varsB = {
            filter: {},
            pagination: {},
        };

        // This filters should allow to display a list with Bruce Willis only.
        const result = {
            filter: {
                groups: [{conditions: [{firstName: 'John'}], join: 'asdf'}, {conditions: [{age: {gt: 40}}]}],
            },
            pagination: {},
        };

        manager.set('a', varsA);
        manager.set('b', varsB);
        expect(manager.variables.value).toEqual(result);
    });

    it('should limit list filters to context with OR condition', () => {
        // List of actors that played Johns or that have more than 40yo
        const contextFilter = {
            filter: {
                groups: [
                    {conditions: [{firstName: 'John'}], join: 'asdf'},
                    {conditions: [{age: {gt: 40}}], groupLogic: 'OR'},
                ],
            },
        };

        // User filter is not different from previous test
        const naturalSearchFilter = {
            filter: {
                groups: [
                    {conditions: [{movie: 'Die Hard 3'}, {movie: 'Die Hard 4'}]},
                    {conditions: [{movie: 'Die Hard 5'}], groupLogic: 'OR'},
                ],
            },
        };

        // Should show all actors that played in Die Hard (3 and 4) or 5 with name John or that have more than 40yo
        const result = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {firstName: 'John'}, // context,
                            {movie: 'Die Hard 3'}, // user (natural-search)
                            {movie: 'Die Hard 4'}, // user (natural-search)
                        ],
                        join: 'asdf',
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {firstName: 'John'}, // context,
                            {movie: 'Die Hard 5'}, // user (natural-search)
                        ],
                        join: 'asdf',
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {age: {gt: 40}}, // context,
                            {movie: 'Die Hard 3'}, // user (natural-search)
                            {movie: 'Die Hard 4'}, // user (natural-search)
                        ],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {age: {gt: 40}}, // context,
                            {movie: 'Die Hard 5'}, // user (natural-search)
                        ],
                    },
                ],
            },
        };

        manager.set('partial-variables', contextFilter);
        manager.set('natural-search', naturalSearchFilter);
        expect(manager.variables.value).toEqual(result);
    });
});
