const clone = require("./clone-helper");

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
function parseTypes(spec) {
    var types = {};
    if ("types" in spec) {
        const typeNames = Object.keys(spec.types);
        for (let i = 0; i < typeNames.length; i++) {
            const typeName = typeNames[i];
            Object.assign(types, parseType(typeName, spec.types[typeName]));
        }
    }
    return types;
}

function parseType(typeName, typeObject) {
    var types = {};
    if (typeObject.type === "object" && "properties" in typeObject) {
        const propNames = Object.keys(typeObject.properties);
        for (let i = 0; i < propNames.length; i++) {
            const propName = propNames[i];
            const propType = typeObject.properties[propName].type;
            if (propType) {
                const fullPropName = typeName + "." + propName;
                types[fullPropName] = propType;
            }
        }
    }
    return types;
}

function objCustomizer(types, input) {
    // Look for type inheritance
    if ("type" in input && "properties" in input && input.type !== "object") {
        const parentType = input.type;
        const propNames = Object.keys(input.properties);
        for (let i = 0; i < propNames.length; i++) {
            const propName = propNames[i];
            const parentPropName = parentType + "." + propName;
            const prop = input.properties[propName];

            if (!("type" in prop) && parentPropName in types) {
                prop.type = types[parentPropName];
            }
        }
    }
    return input;
}

function fixExtendedTypes(input) {
    const types = parseTypes(input);
    return clone(input, objCustomizer.bind(null, types));
}

module.exports = fixExtendedTypes;
