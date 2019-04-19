import { NaturalQueryVariablesManager } from './query-variable-manager';

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
        expect(manager.variables.value)
            .toEqual({
                a: {aa: 12},
                b: 4,
            });

        manager.merge('f', {a: {b: 13}});
        expect(manager.variables.value)
            .toEqual({
                a: {
                    aa: 12,
                    b: 13,
                },
                b: 4,
            });

        // Update an existing channel
        manager.merge('a', {a: {d: 14}});
        expect(manager.variables.value)
            .toEqual({
                a: {
                    aa: 12,
                    b: 13,
                    d: 14,
                },
                b: 4,
            });
    });

    it('should override first found array (from the root) in same channel', () => {

        manager.merge('a',
            {
                myArray: [
                    'a',
                    'b',
                ],
            });
        expect(manager.variables.value)
            .toEqual({
                myArray: [
                    'a',
                    'b',
                ],
            });

        manager.merge('a',
            {
                myArray: [
                    'c',
                    'd',
                ],
            });
        expect(manager.variables.value)
            .toEqual({
                myArray: [
                    'c',
                    'd',
                ],
            });

        manager.merge('a',
            {
                myArray: [
                    {a: 1},
                    {b: 2},
                ],
            });
        expect(manager.variables.value)
            .toEqual({
                myArray: [
                    {a: 1},
                    {b: 2},
                ],
            });

        manager.merge('a', {myArray: [{a: 1}]});
        expect(manager.variables.value).toEqual({myArray: [{a: 1}]});

        manager.merge('a', {myArray: []});
        expect(manager.variables.value).toEqual({myArray: []});

        manager.merge('a', {myArray: [{a: {b: 11}}]});
        expect(manager.variables.value).toEqual({myArray: [{a: {b: 11}}]});

        manager.merge('a',
            {
                myArray: [
                    {
                        a: {
                            b: 12,
                            c: 13,
                        },
                    },
                ],
            });
        expect(manager.variables.value)
            .toEqual({
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
        expect(manager.variables.value)
            .toEqual({
                myArray: [
                    'a',
                    {a: 1},
                ],
            });

        manager.merge('c',
            {
                myArray: [
                    {
                        b: [
                            11,
                            12,
                            13,
                        ],
                    },
                ],
            });
        expect(manager.variables.value)
            .toEqual({
                myArray: [
                    'a',
                    {a: 1},
                    {
                        b: [
                            11,
                            12,
                            13,
                        ],
                    },
                ],
            });

        manager.merge('d',
            {
                myArray: [
                    {
                        b: [
                            14,
                            15,
                            16,
                        ],
                    },
                ],
            });
        expect(manager.variables.value)
            .toEqual({
                myArray: [
                    'a',
                    {a: 1},
                    {
                        b: [
                            11,
                            12,
                            13,
                        ],
                    },
                    {
                        b: [
                            14,
                            15,
                            16,
                        ],
                    },
                ],
            });
    });

    it('should override conditions in graphql typed query variables in same channel', () => {

        const variablesA = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                        ],
                    },
                    {
                        conditions: [
                            {c: {equal: 123}},
                            {d: {equal: 456}},
                        ],
                    },
                ],
            },
        };

        const variablesB = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {e: {equal: 1405}},
                            {f: {equal: 1605}},
                        ],
                    },
                    {
                        conditions: [
                            {g: {equal: 123}},
                            {g: {equal: 456}},
                        ],
                    },
                ],
            },
        };

        manager.merge('a', variablesA);
        expect(manager.variables.value).toEqual(variablesA);

        manager.merge('a', variablesB);
        expect(manager.variables.value).toEqual(variablesB);
    });

    it('should concat conditions in graphql typed query variables in different channels', () => {

        const variablesA = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                        ],
                    },
                    {
                        conditions: [
                            {c: {equal: 123}},
                            {d: {equal: 456}},
                        ],
                    },
                ],
            },
        };

        const variablesB = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {e: {equal: 1405}},
                            {f: {equal: 1605}},
                        ],
                    },
                    {
                        conditions: [
                            {g: {equal: 123}},
                            {g: {equal: 456}},
                        ],
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
                        ],
                    },
                    {
                        conditions: [
                            {c: {equal: 123}},
                            {d: {equal: 456}},
                        ],
                    },
                    {
                        conditions: [
                            {e: {equal: 1405}},
                            {f: {equal: 1605}},
                        ],
                    },
                    {
                        conditions: [
                            {g: {equal: 123}},
                            {g: {equal: 456}},
                        ],
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
                        conditions: [
                            {x: {equal: 'xxxx'}},
                            {y: {equal: 'yyyy'}},
                        ],
                    },
                ],
            },
        };

        const naturalSearch = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                        ],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {c: {equal: 1234}},
                            {d: {equal: 5678}},
                        ],
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

        const naturalSearch1 = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                        ],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {c: {equal: 1234}},
                            {d: {equal: 5678}},
                        ],
                    },
                ],
            },
        };

        const varsA = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {x: {equal: 'xxxx'}},
                            {y: {equal: 'yyyy'}},
                        ],
                    },
                ],
            },
        };

        const resultA = {
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

        const varsB = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {x: {equal: 'x'}},
                            {w: {equal: 'wwww'}},
                        ],
                    },
                ],
            },
        };

        const resultB = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                            {x: {equal: 'x'}},
                            {w: {equal: 'wwww'}},
                        ],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {c: {equal: 1234}},
                            {d: {equal: 5678}},
                            {x: {equal: 'x'}},
                            {w: {equal: 'wwww'}},
                        ],
                    },
                ],
            },
        };

        const naturalSearch2 = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 'aaa'}},
                            {b: {equal: 'bbb'}},
                        ],
                    },
                ],
            },
        };

        const resultC = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 'aaa'}},
                            {b: {equal: 'bbb'}},
                            {x: {equal: 'x'}},
                            {w: {equal: 'wwww'}},
                        ],
                    },
                ],
            },
        };

        manager.set('a', varsA);
        expect(manager.variables.value).toEqual(varsA);

        manager.set('natural-search', naturalSearch1);
        expect(manager.variables.value).toEqual(resultA);

        manager.merge('a', varsB);
        expect(manager.variables.value).toEqual(resultB);

        manager.set('natural-search', naturalSearch2);
        expect(manager.variables.value).toEqual(resultC);
    });

    it('should contextualize target channel including join and other root keys', () => {

        const naturalSearch1 = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                        ],
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {c: {equal: 1234}},
                            {d: {equal: 5678}},
                        ],
                    },
                ],
            },
        };

        // Add context with other root variables and conditions and joins
        const varsA = {
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

        const resultA = {
            state: '123',
            test: {a: 1},
            filter: {
                groups: [
                    {
                        conditions: [
                            {a: {equal: 1405}},
                            {b: {equal: 1605}},
                            {x: {equal: 'xxx'}},
                        ],
                        joins: {y: {conditions: [{checklist: {equal: 'yyy'}}]}},
                    },
                    {
                        groupLogic: 'OR',
                        conditions: [
                            {c: {equal: 1234}},
                            {d: {equal: 5678}},
                            {x: {equal: 'xxx'}},
                        ],
                        joins: {y: {conditions: [{checklist: {equal: 'yyy'}}]}},
                    },
                ],
            },
        };

        manager.set('a', varsA);
        expect(manager.variables.value).toEqual(varsA);

        manager.set('natural-search', naturalSearch1);
        expect(manager.variables.value).toEqual(resultA);

    });
});
