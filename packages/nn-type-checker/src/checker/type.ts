import { CallExpression, TypeNode } from "nn-language";

import { DeclarationScope, Size } from "../resolver";
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

  export function isSame(left: Type, right: Type): boolean {
    if (left.shape.length !== right.shape.length) {
      return false;
    }

    for (let i = 0; i < left.shape.length; i++) {
      const leftSize = left.shape[i];
      const rightSize = right.shape[i];

      if (!SizeType.isSame(leftSize, rightSize)) {
        return false;
      }
    }

    return true;
  }

  export function isAssignable(from: Type, to: Type): [SizeType, Size][] | boolean {
    const result_: [SizeType, Size][] = [];

    if (from.shape.length < to.shape.length) {
      return false;
    }

    for (let i = -1; i >= -to.shape.length; i--) {
      const leftSize = from.shape.at(i)!;
      const rightSize = to.shape.at(i)!;

      const result = SizeType.isSameStructure(leftSize, rightSize);

      if (!result) {
        return false;
      }

      if (result !== true) {
        result_.push(result);
      }
    }

    return result_.length === 0 ? true : result_;
  }

  export function isAssignableExact(from: Type, to: Type): [SizeType, Size][] | boolean {
    const result_: [SizeType, Size][] = [];

    if (from.shape.length !== to.shape.length) {
      return false;
    }

    for (let i = 0; i < from.shape.length; i++) {
      const leftSize = from.shape[i];
      const rightSize = to.shape[i];

      const result = SizeType.isSameStructure(leftSize, rightSize);

      if (!result) {
        return false;
      }

      if (result !== true) {
        result_.push(result);
      }
    }

    return result_.length === 0 ? true : result_;
  }

  export function convert(type: Type, dict: Map<Size, SizeType>): Type {
    return {
      type: 'Tensor',
      shape: type.shape.map(size => SizeType.convert(size, dict))
    }
  }

  export function toString(type: Type): string {
    return `Tensor[${type.shape.map(SizeType.toString).join(', ')}]`;
  }
}
