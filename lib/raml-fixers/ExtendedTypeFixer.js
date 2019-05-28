const Block = require("./Block");

const TYPES_REGEX = /^types:/;
const TYPE_REGEX = /type:/;
const PROPS_REGEX = /properties:/;

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
class ExtendedTypeFixer extends Block {
    constructor (offset) {
        super(offset);
        // True if this block has top level "types:" definition
        this.hasTypes = false;
        this.linesAndBlocks = [];
    }

    addLine(line) {
        this.linesAndBlocks.push(line);
        this.hasTypes = this.hasTypes || TYPES_REGEX.test(line);
    }

    /**
     * Merge the child block without transforming it because this Fixer needs
     * to be able to see the input file as a whole
     *
     * @param {*} block 
     */
    addBlock(block) {
        this.linesAndBlocks.push(block);
    }

    getLinesAndBlocks() {
        return this.linesAndBlocks;
    }

    /**
     * Expand types before returning transformed file
     */
    getOutput() {
        this.fixTypes();

        var output = "";
        for (let i = 0; i < this.linesAndBlocks.length; i++) {
            let lineOrBlock = this.linesAndBlocks[i];
            if (typeof lineOrBlock === "string") {
                output += lineOrBlock + "\n";
            }
            else {
                output += lineOrBlock.getOutput();
            }
        }
        return output;
    }

    /**
     * Named blocks are be stored as a pair of string followed by block object.
     * For example:
     * 
     * ParentType:
     *   type: object
     *   properties:
     *     name1:
     *       type: string
     * 
     * -- is parsed into --
     * 
     * [ "ParentType", Block]
     *
     * @param {*} isName 
     * @param {*} isBlock 
     */
    isNamedBlock(isName, isBlock) {
        if (typeof isName !== "string" || !(isBlock instanceof Block)) {
            return false;
        }
        if (!isName.endsWith(":")) {
            return false;
        }
        return true;
    }

    /**
     * If this block has top level types definition, scan those types
     * and use them to expand types found in all child blocks
     */
    fixTypes() {
        if (!this.hasTypes) {
            return;
        }

        const types = this.parseTypes();
        this.expandTypes(types);
    }

    /**
     * Named blocks are be stored as a pair of string followed by block object
     * (see isNamedBlock() for example). Convert them into a map. This is
     * processing types (e.g. TypeName->TypeDefinitionBlock map) and type
     * properties (e.g. PropertyName->PropertyDefinition map)
     */
    getNamedBlocks() {
        const linesAndBlocks = this.getLinesAndBlocks();
        let namedBlocks = {};
        for (let i = 0; i < linesAndBlocks.length - 1; i++) {
            let name = linesAndBlocks[i];
            let block = linesAndBlocks[i+1];
            if (!this.isNamedBlock(name, block)) {
                continue;
            }
            name = name.trim().slice(0, -1);
            namedBlocks[name] = block;         
        }
        return namedBlocks;
    }

    /**
     * Get a block with the specified name. For example, this method is
     * used to find a block with all properties using name "properties:"
     * @param {*} nameRegex 
     */
    findBlockByName(nameRegex) {
        for (let i = 0; i < this.linesAndBlocks.length - 1; i++) {
            if (this.isNamedBlock(this.linesAndBlocks[i], this.linesAndBlocks[i+1]) && 
                nameRegex.test(this.linesAndBlocks[i])) {
                return this.linesAndBlocks[i+1];
            }
        }
        return null;
    }

    /**
     * Get a value with specified name in this block. This method treats all
     * lines in "name: value" format as name/value pair
     * 
     * @param {*} nameRegex 
     */
    findValueByName(nameRegex) {
        for (let i = 0; i < this.linesAndBlocks.length; i++) {
            if (typeof this.linesAndBlocks[i] !== "string" ||
                !nameRegex.test(this.linesAndBlocks[i])) {
                continue;
            }
            const parts = this.linesAndBlocks[i].trimLeft().split(":", 2);
            if (parts.length < 2) {
                continue;
            }
            return parts[1].trim();
        }
        return null;
    }

    /**
     * Parse global types definition and convert it into a handy map of
     * {TypeName.PropertyName: type}
     */
    parseTypes() {
        const typesBlock = this.findBlockByName(TYPES_REGEX);
        const typeBlocks = typesBlock.getNamedBlocks();
        let types = {};
        for (let name in typeBlocks) {
            this.parseType(types, name, typeBlocks[name]);
        }
        return types;
    }

    parseType(types, name, typeBlock) {
        try {
            const propsBlock = typeBlock.findBlockByName(PROPS_REGEX);
            if (propsBlock != null) {
                this.parseProps(types, name, propsBlock);
            }
        }
        catch (err) {
            this.errors.push("Error parsing type " + name + ": " + err.message);
        }
    }

    parseProps(types, typeName, propsBlock) {
        const propBlocks = propsBlock.getNamedBlocks();
        for (let propName in propBlocks) {
            const propType = propBlocks[propName].findValueByName(TYPE_REGEX)
            if (propType != null) {
                types[typeName + "." + propName] = propType;
            }
        }
    }

    /**
     * Get references to all usages of complex types in this block and its
     * sub-blocks  
     */
    getAllTypeUsages() {
        const typeUsages = [];
        for (let i = 0; i < this.linesAndBlocks.length; i++) {
            const block = this.linesAndBlocks[i];
            if (!(block instanceof Block)) {
                continue;
            }
            // Find all type usage in child blocks
            typeUsages.push(... block.getAllTypeUsages());

            // Check if this block extends a type and has properties
            const parentType = block.findValueByName(TYPE_REGEX);
            const propsBlock = block.findBlockByName(PROPS_REGEX);
            if (parentType != null && parentType !== "object" && propsBlock != null) {
                typeUsages.push({parentType: parentType, propsBlock: propsBlock});
            }
        }
        return typeUsages;
    }

    /**
     * Update all properties without explicitly defined type with parent
     * properties' types
     * 
     * @param {*} types 
     */
    expandTypes(parentTypes) {
        const typeUsages = this.getAllTypeUsages()
        for (let i = 0; i < typeUsages.length; i++) {
            this.expandType(parentTypes, typeUsages[i]);
        }
    }

    expandType(parentTypes, typeUsage) {
        const propBlocks = typeUsage.propsBlock.getNamedBlocks();
        for (let propName in propBlocks) {
            let propType = propBlocks[propName].findValueByName(TYPE_REGEX)
            if (propType == null) {
                // Populate property type using parent
                const fullPropName = typeUsage.parentType + "." + propName;
                if (fullPropName in parentTypes) {
                    propBlocks[propName].addLineAndIndent("type: " + parentTypes[fullPropName]);
                }
            }
        }
    }
}

module.exports = ExtendedTypeFixer;
