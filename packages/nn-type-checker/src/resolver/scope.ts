import type { Declaration } from "nn-language";

import { Value } from "./value";
import { Size } from "./size";
import { Flow } from "./flow";

export interface FileScope {
  path: string;
  declarations: Record<string, DeclarationScope>;
  flows: Record<string, Flow>;
}

export interface DeclarationScope {
  file: FileScope;
  declaration: string;

  flow: Flow;
  node: Declaration;
  sizes: Record<string, Size>;
  values: Record<string, Value>;
}
