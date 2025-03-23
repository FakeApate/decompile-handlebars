import { AnyNode, CallExpression, Identifier } from "acorn";
import {
  CallExpressionProcessor,
  ConditionalExpressionProcessor,
  LiteralProcessor,
  LogicalExpressionProcessor,
  NodeProcessor,
} from "../models/index.js";
import { ProgramMapType } from "../types/index.js";

export default class NodeProcessorFactory {
  static createProcessor(
    node: AnyNode,
    programMap: ProgramMapType,
    varName?: string,
  ): NodeProcessor {
    switch (node.type) {
      case "Literal":
        return new LiteralProcessor(node, programMap, varName);
      case "CallExpression":
        return new CallExpressionProcessor(node, programMap, varName);
      case "ConditionalExpression":
        return new ConditionalExpressionProcessor(node, programMap, varName);
      case "LogicalExpression":
        return new LogicalExpressionProcessor(node, programMap, varName);
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  // Helper to extract a key from a compiled node if it matches a specific pattern.
  static extractKeyFromCompiledNode(node: CallExpression): number | null {
    if (
      node?.type === "CallExpression" &&
      (node.callee as Identifier).name === "c" &&
      node.arguments[0]?.type === "CallExpression" &&
      (node.arguments[0].callee as Identifier).name === "s"
    ) {
      const inner = node.arguments[0].arguments[0];
      if (
        inner?.type === "ConditionalExpression" &&
        inner.consequent?.type === "CallExpression" &&
        inner.consequent.arguments?.length >= 2 &&
        inner.consequent.arguments[1].type === "Literal"
      ) {
        return inner.consequent.arguments[1].value as number;
      }
    }
    return null;
  }
}
