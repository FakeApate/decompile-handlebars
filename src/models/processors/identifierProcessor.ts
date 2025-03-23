// Processor for Identifier nodes.

import { Identifier } from "acorn";
import NodeProcessor from "./nodeProcessor.js";

// Simply returns the identifier's name.
export default class IdentifierProcessor extends NodeProcessor {
  process(): string {
    this.node = this.node as Identifier;
    return this.node.name;
  }
}
