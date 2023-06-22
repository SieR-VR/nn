import * as ohm from "ohm-js";

import { readFileSync } from "fs";

export const nnGrammar = ohm.grammar(
    readFileSync("./src/ohm/nn.ohm", "utf8")
);

const semantics = nnGrammar.createSemantics();

semantics.addOperation("eval()", {

})
