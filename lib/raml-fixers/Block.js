/**
 * A class that represents a block of input text file. Please see 
 * BlockProcessor class for information and examples on how parsing works
 */

class Block {
    constructor (offset) {
        this.offset = offset;
        this.lines = [];
        this.errors = []
    }

    addLine(line) {
        this.lines.push(line);
    }

    addLineAndIndent(line) {
        const indentedLine = Array(this.offset + 1).join(" ") + line;
        this.addLine(indentedLine);
    }

    getLines() {
        return this.lines;
    }

    /**
     * This method gets called when sub-block is complete. Override it to make
     * changes in parsing/transformation behavior. For example see
     * ExtendedTypeFixer which makes changes to markup after file is fully
     * parsed
     * @param {*} block 
     */
    addBlock(block) {
        const blockLines = block.getLines();
        this.lines.push(...blockLines);
    }

    getOffset() {
        return this.offset;
    }

    /**
     * This method gets called after BlockProcessor has consumed all input.
     * Override it to make changes to rendering of the output file
     */
    getOutput() {
        return this.lines.join("\n") + "\n";
    }

    getErrors() {
        return this.errors;
    }
}

module.exports = Block;
