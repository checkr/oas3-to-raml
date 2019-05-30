const oas3ToOas2Converter = require("api-spec-converter");
const oas2ToRamlConverter = require("oas-raml-converter");
const yaml = require("js-yaml");

/**
 * Use api-spec-converter to convert from OpenAPI 3.0 Spec to 
 * OpenAPI 2.0/Swagger
 */
async function convertFromOas3ToOas2(input) {
    const parsedSpec = yaml.safeLoad(input);
    const oas2Spec = await oas3ToOas2Converter.convert({
        from: "openapi_3",
        to: "swagger_2",
        source: parsedSpec
    });
    return oas2Spec.stringify({syntax: "yaml"});
}

/**
 * Use oas-raml-converter to convert from OpenAPI 2.0 to RAML
 */
async function convertFromOas2ToRaml(input) {
    const converter = new oas2ToRamlConverter.Converter(oas2ToRamlConverter.Formats.OAS20,
        oas2ToRamlConverter.Formats.RAML);
    return await converter.convertData(input, {validate: false});
}

module.exports = {
    convertFromOas3ToOas2: convertFromOas3ToOas2,
    convertFromOas2ToRaml: convertFromOas2ToRaml
}
