import { ConditionalExpression } from "acorn";
import { NodeProcessorFactory } from "../../services/index.js";
import NodeProcessor from "./nodeProcessor.js";

export default class ConditionalExpressionProcessor extends NodeProcessor {
  process(): string | null {
    this.node = this.node as ConditionalExpression;
    // Process the test condition (e.g. the binary expression)
    const testProcessor = NodeProcessorFactory.createProcessor(this.node.test, this.programMap);
    const condition = testProcessor.process();

    // Process the consequent (if true)
    const consequentProcessor = NodeProcessorFactory.createProcessor(this.node.consequent, this.programMap);
    const consequentOutput = consequentProcessor.process();

    // Process the alternate (if false)
    const alternateProcessor = NodeProcessorFactory.createProcessor(this.node.alternate, this.programMap);
    const alternateOutput = alternateProcessor.process();

    // Combine the parts into a Handlebars-style conditional expression.
    // Adjust the syntax if needed based on your template requirements.
    return `{{#if ${condition}}}${consequentOutput}{{else}}${alternateOutput}{{/if}}`;
  }
}
