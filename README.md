# OpenAPI 3.0 to RAML Converter

Command-line utility to convert from OpenAPI 3.0 to RAML specification.

## Installation and Usage

1. Install Node and NPM
2. Install dependencies: `npm install`
3. Convert specification:
  `bin/oas3-to-raml -i [input-spec] -o [output-spec]`

Where:
* _input-spec_: Full path to input specification in OpenAPI 3.0 format
* _output-spec_: Full path to output specification. It will be created in RAML
format

## Attributions
This utility depends on the following projects:
* [api-spec-converter](https://github.com/LucyBot-Inc/api-spec-converter):
Convert from OpenAPI 3.0 to OpenAPI 2.0
* [oas-raml-converter](https://github.com/mulesoft/oas-raml-converter):
Convert from OpenAPI 2.0 to RAML
