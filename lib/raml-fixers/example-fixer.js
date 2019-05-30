const clone = require("./clone-helper");

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

function objCustomizer(input) {
    if (input.example != null && !isNaN(input.example) &&
        input.type === "string") {
        input.example = input.example.toString();
    }
    return input;
}

function fixExamples(input) {
    return clone(input, objCustomizer);
}

module.exports = fixExamples;
