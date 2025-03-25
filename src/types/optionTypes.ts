export enum OptionType {
  SimpleOptions = "SimpleOptions",
  BlockOptions = "BlockOptions",
  TemplateRuntimeOptions = "TemplateRuntimeOptions",
}

export type Options = {
  [key: string]: string;
};
