// Processor for BinaryExpression nodes.

import { BinaryExpression } from "acorn";
import { NodeProcessorFactory } from "../../services/index.js";
import NodeProcessor from "./nodeProcessor.js";

// It recursively processes the left and right sub-nodes and joins them with the operator.
export default class BinaryExpressionProcessor extends NodeProcessor {
  process(): string {
    this.node = this.node as BinaryExpression;
    const leftProcessor = NodeProcessorFactory.createProcessor(
      this.node.left,
      this.programMap,
    );
    const rightProcessor = NodeProcessorFactory.createProcessor(
      this.node.right,
      this.programMap,
    );
    const leftOutput = leftProcessor.process();
    const rightOutput = rightProcessor.process();
    return `(${leftOutput} ${this.node.operator} ${rightOutput})`;
  }
}
