const clone = require("./clone-helper");

/**
 * Convert "nullable" types not supported by RAML 1.0 specification to
 * "typename | nil". For example:
 *
 *  type: string
 *  nullable: true
 *
 *  -- converts to --
 *  type: string | nil
 *
 */
function objCustomizer(input) {
    if ("nullable" in input) {
        if ("type" in input && input.nullable === true) {
            input.type += " | nil"
        }
        delete input.nullable;
    }
    return input;
}

function fixNullables(input) {
    return clone(input, objCustomizer);
}

module.exports = fixNullables;
