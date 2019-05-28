const Block = require("./Block");

/**
 * Conver "nullable" types not supported by RAML 1.0 specification to
 * "typename | nil". For example:
 *
 *  type: string
 *  nullable: true
 *
 *  -- converts to --
 *  type: string | nil
 *
 */
class NullableFixer extends Block{
    constructor (offset) {
        super(offset);
        this.nullable = false;
        this.typeIndex = -1;
    }

    /**
     * Perform transformation before returning contents of the block
     * 
     * @param {*} block 
     */
    getLines(block) {
        this.fixType();
        return super.getLines(block);
    }

    addLine(line) {
        if (/^\s*nullable:\s*true.*/.test(line)) {
            this.nullable = true;
            return;
        }
        if (/^\s*type:/.test(line)) {
            this.typeIndex = this.lines.length;
        }
        super.addLine(line);
    }

    fixType() {
        // Append " | nil" to type
        if (this.nullable && this.typeIndex >= 0) {
            this.lines[this.typeIndex] += " | nil";
            this.typeIndex = -1;
        }
    }
}

module.exports = NullableFixer;