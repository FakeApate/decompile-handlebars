import { UnaryExpression } from 'acorn';
import NodeProcessor from './nodeProcessor.js';
import { NodeProcessorFactory } from '../../services/index.js';
export default class UnaryExpressionProcessor extends NodeProcessor {
    process(): string {
        this.node = this.node as UnaryExpression;

        const arg = NodeProcessorFactory.createProcessor(this.node.argument, this.programMap)
        const op = this.node.operator;
        arg.process()
        return op;
    }
}