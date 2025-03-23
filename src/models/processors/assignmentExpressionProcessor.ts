import { AssignmentExpression } from "acorn";
import { NodeProcessorFactory } from "../../services/index.js";
import NodeProcessor from "./nodeProcessor.js";

export default class AssignmentExpressionProcessor extends NodeProcessor {
    process(): string {
        this.node = this.node as AssignmentExpression;
      const leftProcessor = NodeProcessorFactory.createProcessor(this.node.left, this.programMap);
      const rightProcessor = NodeProcessorFactory.createProcessor(this.node.right, this.programMap);
      const leftOutput = leftProcessor.process();
      const rightOutput = rightProcessor.process();
      return `(${leftOutput} ${this.node.operator} ${rightOutput})`;
    }
  }