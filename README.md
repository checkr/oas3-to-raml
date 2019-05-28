# OpenAPI 3.0 to RAML Converter

Command-line wrapper for converting from OpenAPI 3.0 to RAML specification.

## Installation and Usage

1. Install Node and NPM
2. Install dependencies: `npm install`
3. Convert specification:
  `bin/oas3-to-raml -i [input-spec] -w [work-dir] -o [output-spec]`

Where:
* _input-spec_: Full path to input specification in OpenAPI 3.0 format
* _work-dir_: Path to "work" directory where intermediary and log files will
be stored. Converter will automatically create this directory if it doesn't
exist
* _output-spec_: Full path to output specification. It will be created in RAML
format
