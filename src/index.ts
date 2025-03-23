import { readFileSync, writeFileSync } from "fs";
import { parse } from "acorn";

import { extractTemplateMap } from "./utils/map.js";
import { TemplateExtractor } from "./services/index.js";

const inputFile = "./test_data/360.4a5194a0af824ee0df1a.js";
const source = readFileSync(inputFile, "utf-8");

const ast = parse(source, {
  ecmaVersion: "latest",
  allowReturnOutsideFunction: true,
  ranges: true,
});

// Build map of moduleId => template name(s)
const partialTemplates = extractTemplateMap(ast);
writeFileSync("template_map.json", JSON.stringify(partialTemplates, null, 2));

// Extract and clean templates to ./hbs folder
const extractor = new TemplateExtractor(ast);
extractor.extractTemplates();
