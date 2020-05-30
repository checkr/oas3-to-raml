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

function customizer (input) {
  if (!_.isPlainObject(input) || input.example == null ||
        isNaN(input.example) || (input.type !== 'string' && input.type != null) ) {
    // Let caller handle cloning
    return;
  }

  const output = _.cloneDeep(input);
  output.example = output.example.toString();
  if (output.type == null) {
    output.type = 'string'
  }
  return output;
}

function fixExamples (input) {
  return _.cloneDeepWith(input, customizer);
}

module.exports = fixExamples;
