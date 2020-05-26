import {hasMixedGroupLogic} from './query-variable-manager-utils';

describe('hasMixedGroupLogic', () => {
    it('should detect mixed groupLogics', () => {
        const groups1 = [{conditions: [{firstName: 'John'}]}, {conditions: [{age: {gt: 40}}], groupLogic: 'OR'}];
        expect(hasMixedGroupLogic(groups1)).toEqual(false);

        const groups2 = [
            {conditions: [{firstName: 'John'}]},
            {conditions: [{age: {gt: 40}}], groupLogic: 'OR'},
            {conditions: [{age: {lt: 20}}], groupLogic: 'OR'},
        ];
        expect(hasMixedGroupLogic(groups2)).toEqual(false);

        const groups3 = [
            {conditions: [{firstName: 'John'}]},
            {conditions: [{age: {gt: 40}}], groupLogic: 'OR'},
            {conditions: [{age: {lt: 20}}], groupLogic: 'AND'},
        ];
        expect(hasMixedGroupLogic(groups3)).toEqual(true);
    });
});
