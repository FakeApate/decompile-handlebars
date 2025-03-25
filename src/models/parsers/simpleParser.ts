import OptionParser from "./optionParser.js";

export default class SimpleParser extends OptionParser {
  process(): string {
    let extra = "";
    if (this.varName) {
      extra = ` "${this.varName}"`;
    }
    return `{{${this.options.name}${extra}}}`;
  }
}
