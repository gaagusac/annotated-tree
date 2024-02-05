/*
PRODUCTION               |         SEMANTIC RULE
------------------------------------------------------------
1) L -> E n              |    L.val = E.val
2) E -> E1 + T           |    E.val = E1.val + T.val
3) E -> E1 - T           |    E.val = E1.val - T.val
4) E -> T                |    E.val = T.val
5) T -> T1 * F           |    T.val = T1.val * F.val
6) T -> T1 / F           |    T.val = T1.val / F.val
7) T -> F                |    T.val = F.val
8) F -> ( E )            |    F.val = E.val
9) F -> digit            |    F.val = digit.lexval
10) digit -> '0'..'9'    |    digit.lexval = int(digit)
--------------------------------------------------------------
*/

%{

let globalNodeId = 0;
function newId() {
    return (globalNodeId++).toString();
}

%}

/* lexical grammar */
%lex

%%

\s+                     /* skip whitespace */
[0-9]+                  return 'NUMBER';
"*"                     return '*';
"/"                     return '/';
"+"                     return '+';
"-"                     return '-';
"("                     return '(';
")"                     return ')';
<<EOF>>                 return 'EOF';

/lex

/* operator associations and precedence */

%start L

%%

/* language grammar */

L : E EOF {
    $$ = { prod_num: 1,
           id: newId(),
           E: $1,
           val: $1.val };
    globalNodeId = 0;
    return $$;
};

E : E '+' T {
    $$ = { prod_num: 2,
           id: newId(),
           op: { text: "+", id: newId() },
           E: $1,
           T: $3,
           val: $1.val + $3.val };
};

E : E '-' T {
    $$ = { prod_num: 3,
           id: newId(),
           op: { text: "-", id: newId() },
           E: $1,
           T: $3,
           val: $1.val - $3.val };
};

E : T {
    $$ = { prod_num: 4,
           id: newId(),
           T: $1,
           val: $1.val };
};

T : T '*' F {
    $$ = { prod_num: 5,
           id: newId(),
           op: { text: "*", id: newId() },
           T: $1,
           F: $3,
           val: $1.val * $3.val };
};

T : T '/' F {
    $$ = { prod_num: 6,
           id: newId(),
           op: { text: "/", id: newId() },
           T: $1,
           F: $3,
           val: $1.val / $3.val };
};

T : F {
    $$ = { prod_num: 7,
           id: newId(),
           F: $1,
           val: $1.val };
};

F : '(' E ')' {
    $$ = { prod_num: 8,
           id: newId(),
           lp: { text : "(" , id: newId() },
           rp: { text : ")" , id: newId() },
           E: $2,
           val: $2.val };
};

F : digit {
    $$ = { prod_num: 9,
           id : newId(),
           digit: $1,
           val: parseInt($1.lexval, 10) };
};

digit : NUMBER {
    $$ = { prod_num: 10,
           id: newId(),
           lexval : yytext };
};
