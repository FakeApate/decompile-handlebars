import { AnyNode } from "acorn";
import { ProgramMapType } from "../../types/programMapType.js";

export default abstract class NodeProcessor {
    constructor(
      protected node: AnyNode,
      protected programMap: ProgramMapType,
      protected varName?: string
    ) {}
    abstract process(): string | null;
  }