import {
  Program,
  AnyNode,
  Literal,
  PrivateIdentifier,
  ObjectExpression,
  Property,
  Identifier,
  BinaryExpression,
  Expression,
  FunctionExpression,
} from "acorn";
import { ProgramMapType } from "../types/index.js";
import * as walk from "acorn-walk";
import { NodeProcessorFactory } from "./index.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";

// -----------------------
// TemplateExtractor Class
// -----------------------
export default class TemplateExtractor {
  constructor(private ast: Program) {}

  // Process arguments into a string (unchanged from original)

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

  // Process a flat node handler by using our NodeProcessorFactory.
  static processFlatNodeHandler(
    expr: BinaryExpression,
    programMap: ProgramMapType,
  ): string {
    const nodes = TemplateExtractor.flattenBinaryExpression(expr);
    const parts: string[] = [];
    nodes.forEach((n) => {
        const processor = NodeProcessorFactory.createProcessor(n, programMap);
        const res = processor.process();
        if (res === null) {
          console.log("null error");
        }
        parts.push(res);
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
