import { CallExpression, TypeNode } from "nn-language";

import { DeclarationScope } from "../resolver";
import { SizeType } from "./sizetype";

export interface Type {
  type: 'Tensor';
  shape: SizeType[];
}

export namespace Type {
  export function from(node: TypeNode | CallExpression, scope: DeclarationScope): Type {
    return {
      type: 'Tensor',
      shape: node.sizes 
        ? node.sizes.map(size => SizeType.from(size, scope))
        : []
    }
  }
}
