const _ = require('lodash');

/**
 *  Fix string examples that have unquoted numbers, for example:
 *
 *  properties:
 *    name: E-mail
 *    type: string
 *    format: email
 *
 *  -- converts to --
 *
 *  properties:
 *    name: E-mail
 *    type: string
 *    (oas-format): email
 */

function customizer (input) {
  if (!_.isPlainObject(input) || input.format == null) {
    // Let caller handle cloning
    return;
  }

  const output = _.clone(input);
  output['(oas-format)'] = output.format;
  delete output.format;
  return output;
}

function fixFormatType (input) {
  return _.cloneDeepWith(input, customizer);
}

module.exports = fixFormatType;
