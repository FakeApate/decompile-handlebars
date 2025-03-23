import { Literal } from "acorn";
import NodeProcessor from "./nodeProcessor.js";

export default class LiteralProcessor extends NodeProcessor {
    process(): string {
      return (this.node as Literal).value as string;
    }
  }