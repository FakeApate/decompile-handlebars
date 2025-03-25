import { LogicalExpression } from "acorn";
import TemplateExtractor from "../../services/templateExtractor.js";
import NodeProcessor from "./nodeProcessor.js";
import OptionParserFactory from "../../services/optionsParserFactory.js";

export default class LogicalExpressionProcessor extends NodeProcessor {
    process(): string | null {
      const leftLogicBlock = (this.node as LogicalExpression).left; 
      const rightLogicBlock = (this.node as LogicalExpression).right;

      const leftBlocks = TemplateExtractor.collectObjectExpressions(leftLogicBlock);
      const rightBlocks = TemplateExtractor.collectObjectExpressions(rightLogicBlock);

      const leftOptionParser = OptionParserFactory.createParser(leftBlocks, this.programMap)
      const rightOptionParser = OptionParserFactory.createParser(rightBlocks, this.programMap)

      if (rightOptionParser.process() !== "") {
        throw new Error("Expected right side of expression to be empty");
      }
      return leftOptionParser.process();
    }
  }