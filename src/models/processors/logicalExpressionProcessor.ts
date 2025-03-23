import { LogicalExpression } from "acorn";
import TemplateExtractor from "../../services/templateExtractor.js";
import NodeProcessor from "./nodeProcessor.js";

export default class LogicalExpressionProcessor extends NodeProcessor {
    process(): string | null {
      const leftBlocks = TemplateExtractor.collectObjectExpressions((this.node as LogicalExpression).left);
      const leftResult = TemplateExtractor.processBlock(leftBlocks, null, this.programMap);
      const rightBlocks = TemplateExtractor.collectObjectExpressions((this.node as LogicalExpression).right);
      const rightResult = TemplateExtractor.processBlock(rightBlocks, null, this.programMap);
      if (rightResult !== "") {
        throw new Error("Expected right side of expression to be empty");
      }
      return leftResult;
    }
  }