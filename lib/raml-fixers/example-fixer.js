const _ = require('lodash');

/**
 *  Fix string examples that have unquoted numbers, for example:
 *    
 *  properties:
 *    name: Total 
 *    type: string
 *    value: 10.50
 *
 *  -- converts to --
 *
 *  properties:
 *    name: Total
 *    type: string
 *    value: '10.50'
 */

function customizer(input) {
    if (!_.isPlainObject(input) || input.example == null ||
        isNaN(input.example) || input.type !== 'string') {
        // Let caller handle cloning
        return;
    }

    let output = _.cloneDeep(input);
    output.example = output.example.toString();
    return output;
}

function fixExamples(input) {
    return _.cloneDeepWith(input, customizer);
}

module.exports = fixExamples;
