#[derive(Clone, Copy, PartialEq, Debug)]
pub enum CommentKind {
    Line,
    Block,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum BinOpToken {
    Plus,
    Minus,
    Star,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Delimiter {
    Parenthesis,
    Bracket,
    Brace,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum LiteralKind {
    Int,
    Float,
    Bool,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum TokenKind {
    Ident,
    Literal(LiteralKind),
    BinOp(BinOpToken),
    Delimiter(Delimiter),
    Comment(CommentKind),
    Keyword,
    Whitespace,
    Newline,
    Eof,
}