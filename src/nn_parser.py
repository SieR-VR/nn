
from pegen.parser import memoize, memoize_left_rec, logger
from parser_base import ParserBase as Parser
from typing import Any, Optional

from nn_ast import *
from nn_ast.stmts import *
from nn_ast.exprs import *
from nn_ast.types import *
from nn_ast.types.type_expr import *

# Keywords and soft keywords are listed at the end of the parser definition.
class NNParser(Parser):

    @memoize
    def start(self) -> Optional[Source]:
        # start: source
        mark = self._mark()
        if (
            (source := self.source())
        ):
            return source;
        self._reset(mark)
        return None;

    @memoize
    def source(self) -> Optional[Source]:
        # source: statements? $
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (stmts := self.statements(),)
            and
            (self.expect('ENDMARKER'))
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return Source ( stmts , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def statements(self) -> Optional[Any]:
        # statements: statement+
        mark = self._mark()
        if (
            (stmts := self._loop1_1())
        ):
            return stmts;
        self._reset(mark)
        return None;

    @memoize
    def statement(self) -> Optional[Statement]:
        # statement: simple_stmt ';'? NEWLINE+? | compound_stmt NEWLINE+?
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (stmt := self.simple_stmt())
            and
            (self.expect(';'),)
            and
            (self._loop1_2(),)
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return Statement ( stmt , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        if (
            (stmt := self.compound_stmt())
            and
            (self._loop1_3(),)
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return Statement ( stmt , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def simple_stmt(self) -> Optional[Any]:
        # simple_stmt: &'let' decl_stmt | &'import' import_stmt
        mark = self._mark()
        if (
            (self.positive_lookahead(self.expect, 'let'))
            and
            (decl_stmt := self.decl_stmt())
        ):
            return decl_stmt;
        self._reset(mark)
        if (
            (self.positive_lookahead(self.expect, 'import'))
            and
            (import_stmt := self.import_stmt())
        ):
            return import_stmt;
        self._reset(mark)
        return None;

    @memoize
    def compound_stmt(self) -> Optional[Any]:
        # compound_stmt: func_decl_stmt | expr_stmt | &'export' export_stmt | &'{' block_stmt
        mark = self._mark()
        if (
            (func_decl_stmt := self.func_decl_stmt())
        ):
            return func_decl_stmt;
        self._reset(mark)
        if (
            (expr_stmt := self.expr_stmt())
        ):
            return expr_stmt;
        self._reset(mark)
        if (
            (self.positive_lookahead(self.expect, 'export'))
            and
            (export_stmt := self.export_stmt())
        ):
            return export_stmt;
        self._reset(mark)
        if (
            (self.positive_lookahead(self.expect, '{'))
            and
            (block_stmt := self.block_stmt())
        ):
            return block_stmt;
        self._reset(mark)
        return None;

    @memoize
    def decl_stmt(self) -> Optional[Any]:
        # decl_stmt: 'let' NAME ':' type_expr '=' expr ';'
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (self.expect('let'))
            and
            (name := self.name())
            and
            (self.expect(':'))
            and
            (type_expr := self.type_expr())
            and
            (self.expect('='))
            and
            (expr := self.expr())
            and
            (self.expect(';'))
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return DeclStatement ( name , type_expr , expr , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def expr_stmt(self) -> Optional[Any]:
        # expr_stmt: expr
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (expr := self.expr())
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return ExprStatement ( expr , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def func_decl_stmt(self) -> Optional[Any]:
        # func_decl_stmt: NAME func_expr
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (name := self.name())
            and
            (func_expr := self.func_expr())
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return FuncStatement ( name , func_expr , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def import_stmt(self) -> Optional[Any]:
        # import_stmt: 'import' import_list 'from' import_dest
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (self.expect('import'))
            and
            (import_list := self.import_list())
            and
            (self.expect('from'))
            and
            (import_dest := self.import_dest())
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return ImportStatement ( import_list , import_dest , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def export_stmt(self) -> Optional[Any]:
        # export_stmt: 'export' expr
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (self.expect('export'))
            and
            (expr := self.expr())
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return ExportStatement ( expr , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def import_list(self) -> Optional[Any]:
        # import_list: import_item ((',' import_item))* ','?
        mark = self._mark()
        if (
            (import_item := self.import_item())
            and
            (_loop0_4 := self._loop0_4(),)
            and
            (opt := self.expect(','),)
        ):
            return [import_item, _loop0_4, opt];
        self._reset(mark)
        return None;

    @memoize
    def import_item(self) -> Optional[Any]:
        # import_item: NAME ['as' NAME]
        mark = self._mark()
        if (
            (name := self.name())
            and
            (opt := self._tmp_5(),)
        ):
            return [name, opt];
        self._reset(mark)
        return None;

    @memoize
    def import_dest(self) -> Optional[Any]:
        # import_dest: STRING
        mark = self._mark()
        if (
            (string := self.string())
        ):
            return string;
        self._reset(mark)
        return None;

    @memoize
    def block_stmt(self) -> Optional[Any]:
        # block_stmt: '{' statements? '}'
        mark = self._mark()
        if (
            (literal := self.expect('{'))
            and
            (opt := self.statements(),)
            and
            (literal_1 := self.expect('}'))
        ):
            return [literal, opt, literal_1];
        self._reset(mark)
        return None;

    @logger
    def expr(self) -> Optional[Any]:
        # expr: func_expr | call_expr | ident_expr
        mark = self._mark()
        if (
            (func_expr := self.func_expr())
        ):
            return func_expr;
        self._reset(mark)
        if (
            (call_expr := self.call_expr())
        ):
            return call_expr;
        self._reset(mark)
        if (
            (ident_expr := self.ident_expr())
        ):
            return ident_expr;
        self._reset(mark)
        return None;

    @memoize
    def func_expr(self) -> Optional[Any]:
        # func_expr: sizetype_expr_list? type_expr_list? '(' arg_decl ((',' arg_decl))* ','? ')' ':' type_expr NEWLINE* block_stmt
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (sizetype_expr_list := self.sizetype_expr_list(),)
            and
            (type_expr_list := self.type_expr_list(),)
            and
            (self.expect('('))
            and
            (arg_decl_a := self.arg_decl())
            and
            (arg_decl_b := self._loop0_6(),)
            and
            (self.expect(','),)
            and
            (self.expect(')'))
            and
            (self.expect(':'))
            and
            (type_expr := self.type_expr())
            and
            (self._loop0_7(),)
            and
            (block_stmt := self.block_stmt())
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return FuncExpression ( sizetype_expr_list , type_expr_list , [arg_decl_a] + arg_decl_b , type_expr , block_stmt , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize_left_rec
    def call_expr(self) -> Optional[Any]:
        # call_expr: expr '(' expr ((',' expr))* ','? ')'
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (left := self.expr())
            and
            (self.expect('('))
            and
            (right_a := self.expr())
            and
            (right_b := self._loop0_8(),)
            and
            (self.expect(','),)
            and
            (self.expect(')'))
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return CallExpression ( left , [right_a] + right_b , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def ident_expr(self) -> Optional[Any]:
        # ident_expr: NAME
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (name := self.name())
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return IdentExpression ( name , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def arg_decl(self) -> Optional[Any]:
        # arg_decl: NAME ':' type_expr
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (name := self.name())
            and
            (self.expect(':'))
            and
            (type_expr := self.type_expr())
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return ArgumentDecl ( name , type_expr , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def type_expr(self) -> Optional[Any]:
        # type_expr: data_type_expr | func_type_expr
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (data_type_expr := self.data_type_expr())
        ):
            return data_type_expr;
        self._reset(mark)
        if (
            (func_type_expr := self.func_type_expr())
        ):
            return func_type_expr;
        self._reset(mark)
        return None;

    @memoize
    def data_type_expr(self) -> Optional[Any]:
        # data_type_expr: NAME sizetype_expr_list? type_expr_list?
        mark = self._mark()
        tok = self._tokenizer.peek()
        start_lineno, start_col_offset = tok.start
        if (
            (name := self.name())
            and
            (sizetype_expr_list := self.sizetype_expr_list(),)
            and
            (type_expr_list := self.type_expr_list(),)
        ):
            tok = self._tokenizer.get_last_non_whitespace_token()
            end_lineno, end_col_offset = tok.end
            return PrimitiveTypeExpr ( name , sizetype_expr_list , type_expr_list , self . source_file , lineno=start_lineno, col_offset=start_col_offset, end_lineno=end_lineno, end_col_offset=end_col_offset );
        self._reset(mark)
        return None;

    @memoize
    def func_type_expr(self) -> Optional[Any]:
        # func_type_expr: sizetype_expr_list? type_expr_list? (('(' type_expr ((',' type_expr))* ','? ')'))* ':' type_expr
        mark = self._mark()
        if (
            (opt := self.sizetype_expr_list(),)
            and
            (opt_1 := self.type_expr_list(),)
            and
            (_loop0_9 := self._loop0_9(),)
            and
            (literal := self.expect(':'))
            and
            (type_expr := self.type_expr())
        ):
            return [opt, opt_1, _loop0_9, literal, type_expr];
        self._reset(mark)
        return None;

    @memoize
    def type_expr_list(self) -> Optional[Any]:
        # type_expr_list: '<' type_expr ((',' type_expr))* ','? '>'
        mark = self._mark()
        if (
            (literal := self.expect('<'))
            and
            (type_expr := self.type_expr())
            and
            (_loop0_10 := self._loop0_10(),)
            and
            (opt := self.expect(','),)
            and
            (literal_1 := self.expect('>'))
        ):
            return [literal, type_expr, _loop0_10, opt, literal_1];
        self._reset(mark)
        return None;

    @memoize
    def sizetype_expr(self) -> Optional[Any]:
        # sizetype_expr: '...' NAME | NUMBER | NAME
        mark = self._mark()
        if (
            (literal := self.expect('...'))
            and
            (name := self.name())
        ):
            return [literal, name];
        self._reset(mark)
        if (
            (number := self.number())
        ):
            return number;
        self._reset(mark)
        if (
            (name := self.name())
        ):
            return name;
        self._reset(mark)
        return None;

    @memoize
    def sizetype_expr_list(self) -> Optional[Any]:
        # sizetype_expr_list: '[' sizetype_expr ((',' sizetype_expr))* ','? ']'
        mark = self._mark()
        if (
            (literal := self.expect('['))
            and
            (sizetype_expr := self.sizetype_expr())
            and
            (_loop0_11 := self._loop0_11(),)
            and
            (opt := self.expect(','),)
            and
            (literal_1 := self.expect(']'))
        ):
            return [literal, sizetype_expr, _loop0_11, opt, literal_1];
        self._reset(mark)
        return None;

    @memoize
    def _loop1_1(self) -> Optional[Any]:
        # _loop1_1: statement
        mark = self._mark()
        children = []
        while (
            (statement := self.statement())
        ):
            children.append(statement)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop1_2(self) -> Optional[Any]:
        # _loop1_2: NEWLINE
        mark = self._mark()
        children = []
        while (
            (_newline := self.expect('NEWLINE'))
        ):
            children.append(_newline)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop1_3(self) -> Optional[Any]:
        # _loop1_3: NEWLINE
        mark = self._mark()
        children = []
        while (
            (_newline := self.expect('NEWLINE'))
        ):
            children.append(_newline)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop0_4(self) -> Optional[Any]:
        # _loop0_4: (',' import_item)
        mark = self._mark()
        children = []
        while (
            (_tmp_12 := self._tmp_12())
        ):
            children.append(_tmp_12)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _tmp_5(self) -> Optional[Any]:
        # _tmp_5: 'as' NAME
        mark = self._mark()
        if (
            (literal := self.expect('as'))
            and
            (name := self.name())
        ):
            return [literal, name];
        self._reset(mark)
        return None;

    @memoize
    def _loop0_6(self) -> Optional[Any]:
        # _loop0_6: (',' arg_decl)
        mark = self._mark()
        children = []
        while (
            (_tmp_13 := self._tmp_13())
        ):
            children.append(_tmp_13)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop0_7(self) -> Optional[Any]:
        # _loop0_7: NEWLINE
        mark = self._mark()
        children = []
        while (
            (_newline := self.expect('NEWLINE'))
        ):
            children.append(_newline)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop0_8(self) -> Optional[Any]:
        # _loop0_8: (',' expr)
        mark = self._mark()
        children = []
        while (
            (_tmp_14 := self._tmp_14())
        ):
            children.append(_tmp_14)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop0_9(self) -> Optional[Any]:
        # _loop0_9: ('(' type_expr ((',' type_expr))* ','? ')')
        mark = self._mark()
        children = []
        while (
            (_tmp_15 := self._tmp_15())
        ):
            children.append(_tmp_15)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop0_10(self) -> Optional[Any]:
        # _loop0_10: (',' type_expr)
        mark = self._mark()
        children = []
        while (
            (_tmp_16 := self._tmp_16())
        ):
            children.append(_tmp_16)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _loop0_11(self) -> Optional[Any]:
        # _loop0_11: (',' sizetype_expr)
        mark = self._mark()
        children = []
        while (
            (_tmp_17 := self._tmp_17())
        ):
            children.append(_tmp_17)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _tmp_12(self) -> Optional[Any]:
        # _tmp_12: ',' import_item
        mark = self._mark()
        if (
            (literal := self.expect(','))
            and
            (import_item := self.import_item())
        ):
            return [literal, import_item];
        self._reset(mark)
        return None;

    @memoize
    def _tmp_13(self) -> Optional[Any]:
        # _tmp_13: ',' arg_decl
        mark = self._mark()
        if (
            (literal := self.expect(','))
            and
            (arg_decl := self.arg_decl())
        ):
            return [literal, arg_decl];
        self._reset(mark)
        return None;

    @memoize
    def _tmp_14(self) -> Optional[Any]:
        # _tmp_14: ',' expr
        mark = self._mark()
        if (
            (literal := self.expect(','))
            and
            (expr := self.expr())
        ):
            return [literal, expr];
        self._reset(mark)
        return None;

    @memoize
    def _tmp_15(self) -> Optional[Any]:
        # _tmp_15: '(' type_expr ((',' type_expr))* ','? ')'
        mark = self._mark()
        if (
            (literal := self.expect('('))
            and
            (type_expr := self.type_expr())
            and
            (_loop0_18 := self._loop0_18(),)
            and
            (opt := self.expect(','),)
            and
            (literal_1 := self.expect(')'))
        ):
            return [literal, type_expr, _loop0_18, opt, literal_1];
        self._reset(mark)
        return None;

    @memoize
    def _tmp_16(self) -> Optional[Any]:
        # _tmp_16: ',' type_expr
        mark = self._mark()
        if (
            (literal := self.expect(','))
            and
            (type_expr := self.type_expr())
        ):
            return [literal, type_expr];
        self._reset(mark)
        return None;

    @memoize
    def _tmp_17(self) -> Optional[Any]:
        # _tmp_17: ',' sizetype_expr
        mark = self._mark()
        if (
            (literal := self.expect(','))
            and
            (sizetype_expr := self.sizetype_expr())
        ):
            return [literal, sizetype_expr];
        self._reset(mark)
        return None;

    @memoize
    def _loop0_18(self) -> Optional[Any]:
        # _loop0_18: (',' type_expr)
        mark = self._mark()
        children = []
        while (
            (_tmp_19 := self._tmp_19())
        ):
            children.append(_tmp_19)
            mark = self._mark()
        self._reset(mark)
        return children;

    @memoize
    def _tmp_19(self) -> Optional[Any]:
        # _tmp_19: ',' type_expr
        mark = self._mark()
        if (
            (literal := self.expect(','))
            and
            (type_expr := self.type_expr())
        ):
            return [literal, type_expr];
        self._reset(mark)
        return None;

    KEYWORDS = ('as', 'export', 'from', 'import', 'let')
    SOFT_KEYWORDS = ()


if __name__ == '__main__':
    from pegen.parser import simple_parser_main
    simple_parser_main(NNParser)
