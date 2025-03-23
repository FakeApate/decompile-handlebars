import { AnyNode, CallExpression } from "acorn";
import { NodeProcessorFactory, TemplateExtractor } from "../../services/index.js";
import NodeProcessor from "./nodeProcessor.js";

export default class CallExpressionProcessor extends NodeProcessor {
    process(): string | null {
      this.node = this.node as CallExpression;
      // Try to extract a template key using our helper
      const exKey = NodeProcessorFactory.extractKeyFromCompiledNode(this.node);
      if (exKey) {
        return `{{${exKey}}}`;
      }
      // If the first argument is a CallExpression, try to capture a variable name
      if (this.node.arguments[0].type === "CallExpression") {
        const literals = this.node.arguments[0].arguments.filter(
          (n: AnyNode) => n.type === "Literal"
        );
        if (literals.length === 1) {
          this.varName = literals[0].value as string;
        }
      }
      // Collect object expressions and delegate to processBlock
      const objects = TemplateExtractor.collectObjectExpressions(this.node.arguments[0]);
      return TemplateExtractor.processBlock(objects, this.varName, this.programMap);
    }
  }