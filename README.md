# decompile-handlebars

This is an weekend project in attempt to create usable templates back compiled templates.

## Features

- **AST Parsing:** Uses Acorn to parse JavaScript code into an AST.
- **Modular Processing:** Implements a series of `NodeProcessor` classes to process different acorn node types.
- **Factory Pattern:** Dynamically creates processors for AST nodes based on their type.
- Works with minified webpack chunks

The modular approach (aka. the processor) and the factory pattern was chosen to _hopefully_ make the contributor friendly.

## Status

In first development phase, will not work out-of-the-box.

## Contributing

Contributions are welcome! I'm a rookie on how to maintain a repository, but please feel free to open an issue or submit a pull request.
