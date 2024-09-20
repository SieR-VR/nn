/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: 'nn',
  rules: {
    source_file: $ => repeat($.declaration),
    declaration: $ => seq(
      $.ident, 
      optional($.size_decls), 
      $.arguments, 
      "=",
      optional("|>"), 
      $.expression, 
      repeat(seq("|>", $.expression))
    ),
    size_decls: $ => seq("[", $.ident, repeat(seq(",", $.ident)), optional(","), "]"),
    arguments: $ => seq("(", $.argument_decl, repeat(seq(",", $.argument_decl)), optional(","), ")"),
    argument_decl: $ => seq($.ident, ":", $.type),

    expression: $ => choice(
      $.expression_tuple,
      $.expression_call,
      $.expression_ident,
      $.expression_string,
    ),
    expression_plain: $ => choice(
      $.expression_call,
      $.expression_ident,
      $.expression_string,
    ),
    expression_call: $ => prec(20, seq($.ident, optional($.size_type), "(", optional(seq($.expression_plain, repeat(seq(",", $.expression_plain)), optional(","))), ")")),
    expression_tuple: $ => prec(10, seq($.expression_plain, repeat1(seq(",", $.expression_plain)))),
    expression_ident: $ => prec(0, $.ident),
    expression_string: $ => $.string,

    size_type: $ => seq("[", $.size, repeat(seq(",", $.size)), optional(","), "]"),
    size: $ => choice(
      $.size_pow,
      $.size_mul,
      $.size_add,
      $.size_paren,
      $.size_ident,
      $.size_number,
    ),
    size_operation: $ => choice(
      $.size_pow,
      $.size_mul,
      $.size_add,
    ),
    size_pow: $ => prec.left(20, seq($.size, "^", $.size)),
    size_mul: $ => prec.left(10, seq($.size, "*", $.size)),
    size_add: $ => prec.left(0, seq($.size, "+", $.size)),
    size_paren: $ => seq("(", $.size_operation, ")"),
    size_ident: $ => $.ident,
    size_number: $ => $.number,

    type: $ => seq($.ident, optional($.size_type)),
    ident: $ => token(/[a-zA-Z_$][\w_]*/), 

    string: $ => choice($.singleQuotedString, $.doubleQuotedString),
    singleQuotedString: $ => /'[^']*'/,
    doubleQuotedString: $ => /"[^"]*"/,

    number: $ => /-?\d+(\.\d+)?/,
    comment: $ => token(/#.*\n/),
  },
  extras: $ => [
    $.comment,
    /[\s\uFEFF\u2060\u200B\u00A0]/
  ]
})
