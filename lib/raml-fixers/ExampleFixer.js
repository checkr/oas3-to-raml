const Block = require("./Block");

/**
 *  Fix string examples that have unquoted numbers, for example:
 *    
 *  properties:
 *    name: Total 
 *    type: string
 *    value: 10.50
 *
 *  -- converts to --
 *
 *  properties:
 *    name: Total
 *    type: string
 *    value: '10.50'
 */
class ExampleFixer extends Block {
    /**
     * Perform transformation before returning contents of the block
     * 
     * @param {*} block 
     */
    getLines(block) {
        this.fixExample();
        return super.getLines(block);
    }

    fixExample() {
        const type = this.findValueByName("type");
        let example = this.findValueByName("example");
        if (type == null || type !== "string" || example == null) {
            return;
        }

        if (example.startsWith("'") || example.startsWith('"') || isNaN(example)) {
            return;
        }

        example = "'" + example + "'";
        this.replaceValue("example", example);
    }

    findValueByName(name) {
        for (let i = 0; i < this.lines.length; i++) {
            if (!this.lines[i].trim().startsWith(name + ":")) {
                continue;
            }

            const parts = this.lines[i].trimLeft().split(":", 2);
            if (parts.length < 2) {
                return "";
            }
            return parts[1].trim();
        }
        return null;
    }

    replaceValue(name, value) {
        const indentedLine = Array(this.offset + 1).join(" ") + name + ": " + value;
        for (let i = 0; i < this.lines.length; i++) {
            if (this.lines[i].trim().startsWith(name + ":")) {
                this.lines[i] = indentedLine;
            }
        }
    }
}

module.exports = ExampleFixer;
