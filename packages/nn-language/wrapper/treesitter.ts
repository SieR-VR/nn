import Parser from "tree-sitter";
import language from "../bindings/node";

const parser = new Parser()
parser.setLanguage(language)

export {
  parser
};  
