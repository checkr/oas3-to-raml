const _ = require('lodash');

/**
 * Convert 'nullable' types not supported by RAML 1.0 specification to
 * 'typename | nil' or an anyOf representation in the case of objects. For example:
 *
 *  type: string
 *  nullable: true
 *
 *  -- converts to --
 *  type: string | nil
 * 
 *  In the case of 'nullable' objects:
 * 
 *  anyOf:
 *    - <object without nullable>
 *    - type: nil
 *
 */

const NULLABLES = ['nullable', '(nullable)', 'x-nullable'];

function objectCustomizer(input) {
  if (input.type === 'object') {
    //Let caller handle cloning
    return;
  }

  //But if this is a child of an object type, we back to regular customizer.
  return customizer(input);
}

function customizer (input) {
  var nullable = getNullable(input);
  if (nullable === undefined) {
    // Let caller handle cloning
    return;
  }

  let output = {};
  if ('type' in input && nullable === true) {
    if (input.type === 'object') {
      //Objects needs to be cloned fixing their childs first.
      let obj = _.cloneDeepWith(input, objectCustomizer);
      deleteNullable(obj);
      output.anyOf = [];
      output.anyOf.push(obj);
      output.anyOf.push({'type':'nil'});
    } else {
      output = _.cloneDeep(input);
      output.type += ' | nil';
    }
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
