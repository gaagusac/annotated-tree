/*
PRODUCTION           |     SEMANTIC RULE
-----------------------------------------------------
1) L -> En           |  { L.val = E.val }
-----------------------------------------------------
2) E -> TE'          |  { E'.inh = T.val }
                     |  { E.val = E'.syn }
-----------------------------------------------------
3) E'-> +TE'         |  { E1'.inh = E'.inh + T.val }
                     |  { E'.syn = E1'.syn         }
-----------------------------------------------------
4) E'-> -TE'         |  { E1'.in = E'.inh - T.val }
                     |  { E'.syn = E1'.syn        }
-----------------------------------------------------
5) E'-> ε            |  { E'.syn = E'.inh }
-----------------------------------------------------
6) T -> FT'          |  { T'.inh = F.val }
                     |  { T.val = T'.syn }
-----------------------------------------------------
7) T'-> *FT'         |  { T1'.inh = T'.inh * F.val }
                     |  { T'.syn = T1'.syn         }
-----------------------------------------------------
8) T'-> /FT'         |  { T1'.inh = T'.inh / F.val }
                     |  { T'.syn = T1'.syn         }
-----------------------------------------------------
9) T'-> ε            |  { T'.syn = T'.inh }
-----------------------------------------------------
10)F -> (E)          |  { F.val = E.val }
-----------------------------------------------------
11)F -> digit        |  { F.val = digig.lexval }
-----------------------------------------------------
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

\s+                 /* skip whitespace */
[0-9]+              return 'NUMBER';
"*"                 return '*';
"/"                 return '/';
"+"                 return '+';
"-"                 return '-';
"("                 return '(';
")"                 return ')';
<<EOF>>             return 'EOF';

/lex

/* operator associations and precedence */

%ebnf
%start L

%%

/* language grammar */

L : E EOF {
    $$ =  { name: "L",
            type: 1,
            id: newId(),
            E: $1 };
    return $$;
}
;

E : T Ep {
 $$ = { name: "E",
    type: 2,
    id: newId(),
    T: $1,
    Ep: $2
  };
}
;

Ep : ('+'|'-') T Ep {
    $$ = {
       name: "E \'",
       type: 3,
       id: newId(),
       op: { name: $1,
             type: 10,
             id: newId() },
       T: $2,
       Ep: $3
   };
}
|  {
    $$ = {
     name: "E \'",
     type: 4,
     id: newId(),
     epsilonNode: { name: "ε",
                    type: 11,
                    id: newId() }
   };
}
;

T : F Tp {
    $$ = {
          name: "T",
          type: 5,
          id: newId(),
          F: $1,
          Tp: $2
    };
}
;

Tp : ('*'|'/') F Tp {
    $$ = {
        name: "T \'",
        type: 6,
        id: newId(),
        op: { name: $1,
              type: 12,
              id: newId() },
        F: $2,
        Tp: $3
   };
}
| {
$$ = {
    name: "T \'",
    type: 7,
    id: newId(),
    epsilonNode: { name: "ε",
                   type: 13,
                   id: newId() }
  };
}
;

F : '(' E ')' {
    $$ = {
        name: "F",
        type: 8,
        id: newId(),
        lp: { name: "(",
              id: newId() ,
              type: 14 },
        rp: { name: ")",
              id: newId(),
              type: 15 },
        E: $2
    };
}
| NUMBER {
    $$ = {
       name: "F",
       type: 9,
       id: newId(),
       digitNode: { name: "digit",
                    type: 16, lexval: yytext,
                    id: newId() }
      };
}
;
