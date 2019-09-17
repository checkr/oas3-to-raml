const _ = require('lodash');

/**
 * Convert 'nullable' types not supported by RAML 1.0 specification to
 * 'typename | nil'. For example:
 *
 *  type: string
 *  nullable: true
 *
 *  -- converts to --
 *  type: string | nil
 *
 */

const NULLABLES = ['nullable', '(nullable)', 'x-nullable'];

function customizer (input) {
  var nullable = getNullable(input);
  if (nullable === undefined) {
    // Let caller handle cloning
    return;
  }

  const output = _.cloneDeep(input);
  if ('type' in output && nullable === true) {
    output.type += ' | nil';
  }
  deleteNullable(output);
  return output;
}

function getNullable (object) {
  if (!_.isPlainObject(object)) {
    return undefined;
  }
  for (var i = 0; i < NULLABLES.length; i++) {
    if (NULLABLES[i] in object) {
      return object[NULLABLES[i]];
    }
  }
  return undefined;
}

function deleteNullable (object) {
  for (var i = 0; i < NULLABLES.length; i++) {
    delete object[NULLABLES[i]];
  }
}

function fixNullables (input) {
  return _.cloneDeepWith(input, customizer);
}

module.exports = fixNullables;
