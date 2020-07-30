import _ from 'lodash';

import { allOf } from './index';

test( 'allOf', () => {

    expect(allOf({ type: 'object', properties: true}, 'number' )  ).toEqual(
        {
            allOf: [
                { type: 'object', properties: true },
                { type: 'number' },
            ]
        }
    );

});
