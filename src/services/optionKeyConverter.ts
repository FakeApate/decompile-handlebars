import {
  ObjectExpression,
  Property,
  Identifier,
  Literal,
  AnyNode,
  MemberExpression,
  PrivateIdentifier,
  FunctionDeclaration,
  ReturnStatement,
  BinaryExpression,
} from "acorn";
import { ProgramMapType } from "../types/programMapType.js";
import TemplateExtractor from "./templateExtractor.js";

function processArguments(options: ObjectExpression): string {
  if (options.properties.length === 0) return "";
  const result: string[] = [];
  options.properties.forEach((prop: Property) => {
    const key = (prop.key as Identifier).name;
    const value = (prop.value as Literal).value;
    result.push(`${key}="${value}"`);
  });
  return result.join(" ");
}

export default function optionKeyConverter(
  name: string,
  node: AnyNode,
  programMap: ProgramMapType,
): string {
  switch (name) {
    case "name":
      return (node as Literal).value as string;
    case "hash":
      return processArguments(node as ObjectExpression);
    case "loc":
    case "data":
    case "helpers":
    case "partials":
    case "decorators":
      return null;
    case "inverse":
    case "fn":
      if (node.type === "MemberExpression") {
        if (
          ((node as MemberExpression).property as PrivateIdentifier).name ===
          "noop"
        ) {
          return null;
        }
        throw new Error("Non-noop MemberExpression");
      } else if (node.type === "CallExpression") {
        const templateKey = (node.arguments[0] as Literal).value as number;
        const partialBody = (programMap[templateKey] as FunctionDeclaration)
          .body.body;
        const retNode = partialBody[partialBody.length - 1] as ReturnStatement;
        return TemplateExtractor.processPartialNodeHandler(
          retNode.argument as BinaryExpression,
          programMap,
        );
      }
      throw new Error("Unexpected type");
    default:
      console.log(name);
      return null;
  }
}
