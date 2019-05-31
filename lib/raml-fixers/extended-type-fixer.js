const _ = require('lodash');

/**
 * Expand type definitions for properties of inherited types. For example:
 *
 * ParentType:
 *   type: object
 *   properties:
 *     name1:
 *       type: string
 * ChildType:
 *   type: ParentType
 *   properties:
 *     name1:
 *       example: John Smith
 *
 * -- converts to --
 *
 * ParentType:
 *   type: object
 *   properties:
 *     name1:
 *       type: string
 * ChildType:
 *   type: ParentType
 *   properties:
 *     name1:
 *       example: John Smith
 *       type: string
 *
 * This fixer works for both named and unnamed types. For example, an unnamed
 * type may be inline type definition in resource response
 */

/**
 * Parse global types definitions and convert them into a map of
 * {TypeName.PropertyName: type}
 */
function parseTypes (spec) {
  const types = {};
  if ('types' in spec) {
    const typeNames = Object.keys(spec.types);
    for (let i = 0; i < typeNames.length; i++) {
      const typeName = typeNames[i];
      Object.assign(types, parseType(typeName, spec.types[typeName]));
    }
  }
  return types;
}

function parseType (typeName, typeObject) {
  const types = {};
  if (typeObject.type === 'object' && 'properties' in typeObject) {
    const propNames = Object.keys(typeObject.properties);
    for (let i = 0; i < propNames.length; i++) {
      const propName = propNames[i];
      const propType = typeObject.properties[propName].type;
      if (propType) {
        const fullPropName = typeName + '.' + propName;
        types[fullPropName] = propType;
      }
    }
  }
  return types;
}

function clonePlainObject (input, customizerFunc) {
  var output = {};
  for (const i in input) {
    output[i] = _.cloneDeepWith(input[i], customizerFunc);
  }
  return output;
}

function customizer (types, input) {
  // Check if this block uses type inheritance
  if (!_.isPlainObject(input) || !('type' in input) ||
        !('properties' in input) || input.type === 'object') {
    // Let caller handle cloning
    return;
  }

  const output = clonePlainObject(input, (i) => customizer(types, i));
  const parentType = output.type;
  const propNames = Object.keys(output.properties);
  for (let i = 0; i < propNames.length; i++) {
    const propName = propNames[i];
    const parentPropName = parentType + '.' + propName;
    const prop = output.properties[propName];

    if (!('type' in prop) && parentPropName in types) {
      prop.type = types[parentPropName];
    }
  }

  return output;
}

function fixExtendedTypes (input) {
  const types = parseTypes(input);
  return _.cloneDeepWith(input, (i) => customizer(types, i));
}

module.exports = fixExtendedTypes;
