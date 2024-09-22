import { match_string } from 'ts-features';
import { SizeNode } from 'nn-language';

import { DeclarationScope, findSize, Size } from '../resolver';

export interface SizeType {
  left: Size | SizeType | number;
  right?: SizeType;

  computeKind: 'pow' | 'mul' | 'add' | 'ident' | 'number';
}

export namespace SizeType {
  export function from(node: SizeNode, scope: DeclarationScope): SizeType {
    return match_string<SizeType, SizeNode["sizeType"]>(node.sizeType, {
      add: () => ({
        left: from(node.left!, scope),
        right: from(node.right!, scope),

        computeKind: 'add',
        type: 'Size',
      }),
      mul: () => ({
        left: from(node.left!, scope),
        right: from(node.right!, scope),

        computeKind: 'mul',
        type: 'Size',
      }),
      pow: () => ({
        left: from(node.left!, scope),
        right: from(node.right!, scope),

        computeKind: 'pow',
        type: 'Size',
      }),
      ident: () => ({
        left: findSize(scope, node.ident!)!,
        computeKind: 'ident',
        type: 'Size',
      }),
      number: () => ({
        left: node.number!,
        computeKind: 'number',
        type: 'Size',
      })
    })
  }

  export function isSame(left: SizeType, right: SizeType): boolean {
    if (left.computeKind !== right.computeKind) {
      return false;
    }

    switch (left.computeKind) {
      case 'add':
      case 'mul':
      case 'pow':
        return isSame(left.left as SizeType, right.left as SizeType) && isSame(left.right as SizeType, right.right as SizeType);
      case 'ident':
        return left.left === right.left;
      case 'number':
        return left.left === right.left;
    }
  }

  export function isSameStructure(left: SizeType, right: SizeType): [SizeType, Size] | boolean {
    if (right.computeKind !== 'ident' && (left.computeKind !== right.computeKind)) {
      return false;
    }

    switch (right.computeKind) {
      case 'add':
      case 'mul':
      case 'pow':
        return isSameStructure(left.left as SizeType, right.left as SizeType) && isSameStructure(left.right as SizeType, right.right as SizeType);
      case 'ident':
        return [left, right.left] as [SizeType, Size];
      case 'number':
        return left.left === right.left;
    }
  }

  export function convert(size: SizeType, dict: Map<Size, SizeType>): SizeType {
    switch (size.computeKind) {
      case 'add':
        return {
          left: convert(size.left as SizeType, dict),
          right: convert(size.right as SizeType, dict),

          computeKind: 'add',
        };
      case 'mul':
        return {
          left: convert(size.left as SizeType, dict),
          right: convert(size.right as SizeType, dict),

          computeKind: 'mul',
        };
      case 'pow':
        return {
          left: convert(size.left as SizeType, dict),
          right: convert(size.right as SizeType, dict),

          computeKind: 'pow',
        };
      case 'ident':
        return dict.get(size.left as Size)!;
      case 'number':
        return {
          left: size.left,
          computeKind: 'number',
        };
    }
  }

  export function toString(size: SizeType): string {
    switch (size.computeKind) {
      case 'add':
        return `${toString(size.left as SizeType)} + ${toString(size.right as SizeType)}`;
      case 'mul':
        return `${toString(size.left as SizeType)} * ${toString(size.right as SizeType)}`;
      case 'pow':
        return `${toString(size.left as SizeType)} ^ ${toString(size.right as SizeType)}`;
      case 'ident':
        return (size.left as Size).ident;
      case 'number':
        return size.left.toString();
    }
  }
}
