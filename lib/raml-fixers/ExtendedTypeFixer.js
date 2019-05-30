const SpecTransformer = require("./SpecTransformer");

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
 * This class works for both named and unnamed types. For example, an unnamed
 * type may be inline type definition in resource response
 */
class ExtendedTypeFixer extends SpecTransformer {
    constructor (spec) {
        super(spec);
        this.types = this.parseTypes();
    }

    /**
     * Parse global types definitions and convert them into a map of
     * {TypeName.PropertyName: type}
     */
    parseTypes() {
        var types = {};
        if ("types" in this.spec) {
            const typeNames = Object.keys(this.spec.types);
            for (let i = 0; i < typeNames.length; i++) {
                const typeName = typeNames[i];
                Object.assign(types, this.parseType(typeName, this.spec.types[typeName]));
            }
        }
        return types;
    }

    parseType(typeName, typeObject) {
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

    /**
     * When copying an object use parent property's type if child doesn't
     * define one
     * @param {*} input 
     */
    copyObject(input) {
        var output = super.copyObject(input);
        // Look for type inheritance
        if ("type" in output && "properties" in output && output.type !== "object") {
            const parentType = output.type;
            const propNames = Object.keys(output.properties);
            for (let i = 0; i < propNames.length; i++) {
                const propName = propNames[i];
                const parentPropName = parentType + "." + propName;
                const prop = output.properties[propName];

                if (!("type" in prop) && parentPropName in this.types) {
                    prop.type = this.types[parentPropName];
                }
            }
        }
        return output;
    }
}

module.exports = ExtendedTypeFixer;
