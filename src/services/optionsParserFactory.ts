import { Options, OptionType, ProgramMapType } from "../types/index.js";
import {
  BlockParser,
  OptionParser,
  SimpleParser,
  TemplateRuntimeParser,
} from "../models/parsers/index.js";
import {Identifier, Literal, ObjectExpression,Property} from "acorn";
import optionKeyConverter from "./optionKeyConverter.js";



const OPTION_KEY_MAP: Map<OptionType, string[]> = new Map([
  [OptionType.SimpleOptions, ["name", "hash", "data", "loc"]],
  [OptionType.BlockOptions, ["name", "hash", "fn", "inverse", "data", "loc"]],
  [
    OptionType.TemplateRuntimeOptions,
    ["name", "hash", "data", "helpers", "partials", "decorators"],
  ],
]);

function objectFilter(n: ObjectExpression) {
  if (n.properties?.length < 4) return false;
  const prop = n.properties[0] as Property;
  const key = prop.key as Identifier;
  return key.name === "name";
}

function findOptionsObject(
    objects: (ObjectExpression | Literal)[],
  ): ObjectExpression | string{
    if (objects.length === 0) {
      return "";
    }
    if (objects.length === 1 && objects[0].type === "Literal") {
      return objects[0].value as string;
    }

    const res = objects.filter(objectFilter) as ObjectExpression[];

    if (res.length !== 1) {
      throw new Error("Didn't find or found too many nodes");
    }

    res[0].properties.forEach((p) => {
      if (p.type !== "Property")
        throw new Error("Property type is not Property");
    });

    return res[0];
  }

function compareKeys(actual: string[], expected: string[]): boolean {
    return (
      actual.length === expected.length &&
      actual.every((key, index) => key === expected[index])
    );
  }

function getOptionType(options: Options): OptionType {
  const keys = Object.keys(options);
  for (const [optionType, value] of OPTION_KEY_MAP) {
    if (compareKeys(keys, value)) {
      return optionType;
    }
  }
  throw new Error("Not a valid type");
}
function processOptions(
  optionsNode: ObjectExpression | string,
  programMap: ProgramMapType,
): { [key: string]: string } {
    if(typeof optionsNode === "string"){
        return {
            "name": optionsNode,
            "hash": null,
            "data": null,
            "loc": null
        }
    }
  const result: { [key: string]: string } = {};
  optionsNode.properties.forEach((prop: Property) => {
    const key = (prop.key as Identifier).name;
    result[key] = optionKeyConverter(
      key,
      prop.value,
      programMap,
    );
  });
  return result;
}
export default class OptionParserFactory {
  static createParser(objects: (ObjectExpression | Literal)[], programMap: ProgramMapType, varName?: string): OptionParser {
    const options = processOptions(findOptionsObject(objects), programMap) 
    const type = getOptionType(options);
    switch (type) {
      case OptionType.BlockOptions:
        return new BlockParser(options);
      case OptionType.SimpleOptions:
        if (options.hash) {
          throw new Error("Hash detected in Simple Options");
        }
        return new SimpleParser(options, varName);
      case OptionType.TemplateRuntimeOptions:
        return new TemplateRuntimeParser(options);
      default:
        throw new Error(`Unsupported option type: ${type}`);
    }
  }
}
