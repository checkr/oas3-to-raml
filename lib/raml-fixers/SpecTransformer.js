/**
 * Base helper class to use with RAML fixers in this library. This class
 * performs deep copy of RAML spec being transformed and is effectively a no-op
 */
class SpecTransformer {
    constructor (spec) {
        this.spec = spec;
    }

    copyObject(input) {
        var output = {};
        for (let i in input) {
            output[i] = this.copyValue(input[i]);
        }
        return output;
    }
    
    copyArray(input) {
        var output = [];
        for (let i = 0; i < input.length; i++) {
            output.push(this.copyObject(input[i]));
        }
        return output;
    }

    copyValue(input) {
        if (input instanceof Array) {
            return this.copyArray(input)
        }
        else if (input instanceof Object) {
            return this.copyObject(input);
        }
        else {
            return input;
        }
    }

    transform() {
        return this.copyObject(this.spec);
    }
}

module.exports = SpecTransformer;
