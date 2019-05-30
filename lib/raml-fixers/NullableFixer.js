const SpecTransformer = require("./SpecTransformer");

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

class NullableFixer extends SpecTransformer {
    copyObject(input) {
        var output = super.copyObject(input);
        if ("nullable" in output) {
            if ("type" in output && output.nullable === true) {
                output.type += " | nil"
            }
            delete output.nullable;
        }
        return output;
    }
}

module.exports = NullableFixer;
