import {
  Program,
  AnyNode,
  Literal,
  MemberExpression,
  PrivateIdentifier,
  FunctionDeclaration,
  ReturnStatement,
  ObjectExpression,
  Property,
  Identifier,
  BinaryExpression,
  Expression,
  FunctionExpression,
} from "acorn";
import { OptionTypes, ProgramMapType } from "../types/index.js";
import * as walk from "acorn-walk";
import { NodeProcessorFactory } from "./index.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";

// -----------------------
// TemplateExtractor Class
// -----------------------
export default class TemplateExtractor {
  constructor(private ast: Program) {}

  // Compare keys helper (unchanged from original)
  static compareKeys(actual: string[], expected: string[]): boolean {
    return (
      actual.length === expected.length &&
      actual.every((key, index) => key === expected[index])
    );
  }

  // Determine option type based on object keys
  static getOptionType(options: { [key: string]: string }): OptionTypes {
    const keys = Object.keys(options);
    if (TemplateExtractor.compareKeys(keys, ["name", "hash", "data", "loc"])) {
      return OptionTypes.SimpleOptions;
    } else if (
      TemplateExtractor.compareKeys(keys, [
        "name",
        "hash",
        "fn",
        "inverse",
        "data",
        "loc",
      ])
    ) {
      return OptionTypes.BlockOptions;
    } else if (
      TemplateExtractor.compareKeys(keys, [
        "name",
        "hash",
        "data",
        "helpers",
        "partials",
        "decorators",
      ])
    ) {
      return OptionTypes.TemplateRuntimeOptions;
    }
    throw new Error("Not a valid type");
  }

  // Process options properties
  static processOptions(
    optionsNode: ObjectExpression,
    programMap: ProgramMapType,
  ): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    optionsNode.properties.forEach((prop: Property) => {
      const key = (prop.key as Identifier).name;
      result[key] = TemplateExtractor.optionConverter(
        key,
        prop.value,
        programMap,
      );
    });
    return result;
  }

  // Process block of object expressions to generate template string
  // TODO Move logic to indiviual processors
  static processBlock(
    nodes: AnyNode[],
    varName: string | null,
    programMap: ProgramMapType,
  ): string {
    if (nodes.length === 0) return "";
    if (nodes.length === 1 && nodes[0].type === "Literal")
      return nodes[0].value as string;
    const res = nodes.filter(
      (n: ObjectExpression) =>
        n.properties?.length >= 4 &&
        ((n.properties[0] as Property).key as Identifier).name === "name",
    ) as ObjectExpression[];
    if (res.length !== 1) {
      throw new Error("Didn't find or found too many nodes");
    }
    res[0].properties.forEach((p) => {
      if (p.type !== "Property")
        throw new Error("Property type is not Property");
    });
    const options = TemplateExtractor.processOptions(res[0], programMap);
    const optionType = TemplateExtractor.getOptionType(options);
    let extra = "";
    switch (optionType) {
      case OptionTypes.BlockOptions:
        // Extend block options processing here as needed.
        break;
      case OptionTypes.SimpleOptions:
        if (options.hash) {
          throw new Error("Hash detected in Simple Options");
        }
        if (varName) {
          extra = ` "${varName}"`;
        }
        return `{{${options.name}${extra}}}`;
      case OptionTypes.TemplateRuntimeOptions:
        if (options.hash) {
          extra = ` ${options.hash}`;
        }
        return `{{> ${options.name}${extra}}}`;
      default:
        throw new Error("Invalid OptionType");
    }
    return "";
  }

  // Process arguments into a string (unchanged from original)
  static processArguments(options: ObjectExpression): string {
    if (options.properties.length === 0) return "";
    const result: string[] = [];
    options.properties.forEach((prop: Property) => {
      const key = (prop.key as Identifier).name;
      const value = (prop.value as Literal).value;
      result.push(`${key}="${value}"`);
    });
    return result.join(" ");
  }

  // Flatten a binary expression into its component nodes.
  static flattenBinaryExpression(
    expr: BinaryExpression,
  ): (Expression | PrivateIdentifier)[] {
    const parts: (Expression | PrivateIdentifier)[] = [];
    function recurse(node: Expression | PrivateIdentifier) {
      if (node.type === "BinaryExpression") {
        recurse(node.left);
        recurse(node.right);
      } else {
        parts.push(node);
      }
    }
    recurse(expr);
    return parts;
  }

  // Walk the node to collect any object expressions.
  static collectObjectExpressions(
    rootNode: AnyNode,
  ): (ObjectExpression | Literal)[] {
    if (rootNode.type === "Literal") return [rootNode];
    const objects: ObjectExpression[] = [];
    walk.simple(rootNode, {
      ObjectExpression(node) {
        objects.push(node);
      },
    });
    return objects;
  }

  // Convert an option by its name.
  static optionConverter(
    name: string,
    node: AnyNode,
    programMap: ProgramMapType,
  ): string {
    switch (name) {
      case "name":
        return (node as Literal).value as string;
      case "hash":
        return TemplateExtractor.processArguments(node as ObjectExpression);
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
          const retNode = partialBody[
            partialBody.length - 1
          ] as ReturnStatement;
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

  // Process a flat node handler by using our NodeProcessorFactory.
  static processFlatNodeHandler(
    expr: BinaryExpression,
    programMap: ProgramMapType,
  ): string {
    const nodes = TemplateExtractor.flattenBinaryExpression(expr);
    const parts: string[] = [];
    nodes.forEach((n) => {
      try {
        const processor = NodeProcessorFactory.createProcessor(n, programMap);
        const res = processor.process();
        if (res === null) {
          console.log("null error");
        }
        parts.push(res);
      } catch (error) {
        console.error("Error processing node:", error);
      }
    });
    return parts.join("");
  }

  // Process a partial node handler similarly.
  static processPartialNodeHandler(
    expr: BinaryExpression,
    programMap: ProgramMapType,
  ): string {
    const nodes = TemplateExtractor.flattenBinaryExpression(expr);
    const parts: string[] = [];
    nodes.forEach((n) => {
      const processor = NodeProcessorFactory.createProcessor(n, programMap);
      parts.push(processor.process() || "");
    });
    return parts.join("");
  }

  // Extract templates from the AST.
  extractTemplates(): void {
    const outputDir = "./hbs";
    if (!existsSync(outputDir)) mkdirSync(outputDir);

    walk.fullAncestor(this.ast, (node: AnyNode, _state, ancestors) => {
      if (
        node.type === "Property" &&
        ((node as Property).key as Identifier).name === "main" &&
        (node as Property).value.type === "FunctionExpression"
      ) {
        // Find the module property to obtain a module ID.
        const moduleProperty = ancestors.find(
          (a: Property) =>
            a.type === "Property" &&
            (a.value.type === "ArrowFunctionExpression" ||
              a.value.type === "FunctionExpression"),
        ) as Property;
        const moduleId = (moduleProperty?.key as Literal).value as number;
        // Get the program map from a template definition node.
        const templateDef = ancestors[ancestors.length - 2] as ObjectExpression;
        const programMap = this.processProps(templateDef);
        const fnBody = (node.value as FunctionExpression).body.body;
        for (const stmt of fnBody) {
          if (stmt.type === "ReturnStatement") {
            const template = TemplateExtractor.processFlatNodeHandler(
              stmt.argument as BinaryExpression,
              programMap,
            );
            // For example, write the extracted template to a file.
            writeFileSync(`${outputDir}/template_${moduleId}.hbs`, template);
          }
        }
      }
    });
  }

  // Helper to process properties into a simple map.
  private processProps(node: ObjectExpression): { [key: string]: Expression } {
    const result: { [key: string]: Expression } = {};
    node.properties.forEach((prop: Property) => {
      const key =
        (prop.key as Identifier).name ||
        ((prop.key as Literal).value as string);
      result[key] = prop.value;
    });
    return result;
  }
}

// Export TemplateExtractor for external use.
export { TemplateExtractor };
