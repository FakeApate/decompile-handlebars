import OptionParser from "./optionParser.js";

export default class TemplateRuntimeParser extends OptionParser {
  process(): string {
    let extra = "";
    if (this.options.hash) {
      extra = ` ${this.options.hash}`;
    }
    return `{{> ${this.options.name}${extra}}}`;
  }
}
