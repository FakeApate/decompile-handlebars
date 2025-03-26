import OptionParser from "./optionParser.js";

export default class SimpleParser extends OptionParser {
  process(): string {
    if(!this.varName && this.options.name === "") return "";
    let extra = "";
    if (this.varName) {
      extra = ` "${this.varName}"`;
    }
    return `{{${this.options.name}${extra}}}`;
  }
}
