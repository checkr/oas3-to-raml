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
 *    - <object without nullable property>
 *    - type: nil
 *
 */

const NULLABLES = ['nullable', '(nullable)', 'x-nullable'];

function customizer (input) {
  var nullable = getNullable(input);
  if (nullable === undefined) {
    // Let caller handle cloning
    return;
  }

  //If we are in this point it's because we are the input it's nullable.
  var output = {};
  if ('type' in input) { 
    if (input.type === 'object') {
      //Objects needs to be cloned fixing their nullable childs first.
      let obj = _.cloneDeepWith(input, objectCustomizer);
      deleteNullable(obj);
      output.anyOf = [];
      output.anyOf.push(obj);
      output.anyOf.push({'type':'nil'});
    } else {
      //Nullable and not an object.
      output = _.cloneDeep(input);
      output.type += ' | nil';
      deleteNullable(output);
    }
  } else {
    //Nullable without a type.
    output = _.cloneDeep(input);
    deleteNullable(output);
  }
  return output;
}

  function objectCustomizer(input) {
    if (input.type === 'object') {
      //Let caller handle cloning and do the work after.
      //That's why is a different method.
      return;
    }
    //But if this is a child of an object type, we back to regular customizer.
    return customizer(input);
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
