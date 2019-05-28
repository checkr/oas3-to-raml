/**
 * Transformer for YAML-like files. This class breaks up input text file into
 * blocks based on indentation. Then implementations of Block class can view
 * and makes changes within the scope of the block and its children.
 * 
 * For example, consider markup:
 * 
 *   name1: value1
 *     name2: value2
 *     name3: value3
 *   name4: value4
 * 
 *  It will result in 2 instances of class Block:
 * 
 *  Instance 1:
 *    Offset = 0;
 *    Contents:
 *      name1: value1
 *      name4: value4
 * 
 *  Instance 2:
 *    Offset = 2;
 *    Contents:
 *      name2: value2
 *      name3: value3
 */
class BlockProcessor {
    constructor  (CodeBlock) {
        this.BlockClass = CodeBlock;
        this.blockStack = [new this.BlockClass(0)];
        this.errors = [];
    }

    /**
     * Consume new line by adding it to current Block. If the indentation of
     * the line doesn't match the indentation of the Block:
     *   - Create child Block when line indentation > current block
     *   - Merge Block into its parent when line indetation < current block
     * @param {*} line 
     */
    addLine(line) {
        let block = this.blockStack[this.blockStack.length-1];

        // Add empty lines and full line comments to current block
        if (/^\s*$/.test(line) || /^\s*#.*$/.test(line)) {
            block.addLine(line);
            return;
        }

        const offset = line.search(/\S|$/);
        while (offset < block.getOffset()) {
            this.popBlock();
            block = this.blockStack[this.blockStack.length-1];
        }

        if (offset > block.getOffset()) {
            this.pushBlock(offset, line);
            return;
        }

        block.addLine(line);
    }

    /**
     * Create a child block and add a line to it
     * 
     * @param {*} offset 
     * @param {*} line 
     */
    pushBlock(offset, line) {
        const block = new this.BlockClass(offset);
        block.addLine(line);
        this.blockStack.push(block);
    }

    /**
     * Merge current block into its parent (e.g. when end of block is detected)
     */
    popBlock() {
        const poppedBlock = this.blockStack.pop();
        this.errors.push(... poppedBlock.getErrors());
        const block = this.blockStack[this.blockStack.length-1];
        block.addBlock(poppedBlock);
    }

    /**
     * Get transformed representation of the input parsed by this file.
     */
    getOutput() {
        while(this.blockStack.length > 1) {
            this.popBlock();
        }
        const block = this.blockStack[this.blockStack.length-1];
        this.errors.push(... block.getErrors());
        return { output: block.getOutput(), errors: (this.errors.join("\n") + "\n") };
    }
}

module.exports = BlockProcessor;