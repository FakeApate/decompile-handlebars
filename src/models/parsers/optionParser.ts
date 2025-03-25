import { Options } from "../../types/index.js";

export default abstract class OptionParser {
  constructor(
    protected options: Options,
    protected varName?: string,
  ) {}

  abstract process(): string;
}
