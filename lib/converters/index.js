const oas3ToOas2Converter = require("api-spec-converter");
const oas2ToRamlConverter = require("oas-raml-converter");

/**
 * Use api-spec-converter to convert from OpenAPI 3.0 Spec to 
 * OpenAPI 2.0/Swagger
 *
 * @param {*} filename 
 */
async function convertFromOas3ToOas2(filename) {
    const oas2Spec = await oas3ToOas2Converter.convert({
        from: "openapi_3",
        to: "swagger_2",
        source: filename
    });
    const output = oas2Spec.stringify({syntax: "yaml"});

    const validationResult = await oas2Spec.validate();
    const errors = validationResult.errors ? JSON.stringify(validationResult.errors, null, 2) : "";
    const warnings = validationResult.warnings ? JSON.stringify(validationResult.warnings, null, 2) : "";

    return { output: output, errors: (errors + warnings) };
}

/**
 * Use oas-raml-converter to convert from OpenAPI 2.0 to RAML
 *
 * @param {*} filename 
 */
async function convertFromOas2ToRaml(filename) {
    const converter = new oas2ToRamlConverter.Converter(oas2ToRamlConverter.Formats.OAS20,
        oas2ToRamlConverter.Formats.RAML);
    ramlSpec = await converter.convertFile(filename, { validate: false });
    return { output: ramlSpec, errors: "" };
}

module.exports = {
    convertFromOas3ToOas2: convertFromOas3ToOas2,
    convertFromOas2ToRaml: convertFromOas2ToRaml
}