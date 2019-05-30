const SpecTransformer = require("./SpecTransformer");

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
class ExampleFixer extends SpecTransformer {
    copyObject(input) {
        var output = super.copyObject(input);
        if (!isNaN(output.example) && output.type === "string") {
            output.example = output.example.toString();
        }
        return output;
    }
}

module.exports = ExampleFixer;
