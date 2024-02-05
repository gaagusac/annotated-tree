// Builds a graph in graphviz dot language, for the sdd 5.1
let Graph5dot1 = (function() {
    let buffer = "";
    let labelNode = function (node, pName) {
        buffer += `\t${node.id.toString()} [label="${pName}.val=${node.val}"];\n`;
    };
    let labelLeafNode = function (node) {
        if (node.hasOwnProperty('prod_num')) {
            buffer += `\t${node.id.toString()} [label="digit.lexval=${node.lexval}"];\n`;
        } else {
            buffer += `\t${node.id.toString()} [label="${node.text}"];\n`;
        }
    };
    let makeEdge = function (fromNode, toNode) {
        buffer +=`\t${fromNode.id.toString()} -> ${toNode.id.toString()};\n`;
    };
    let toDot = function (node) {
        switch (node.prod_num) {
            case 1: {
                // L => En
                labelNode(node, "L");
                toDot(node.E);
                makeEdge(node, node.E);
                break;
            }
            case 2:
            case 3: {
                // E => E + T | E - T
                labelNode(node, "E");
                toDot(node.E);
                labelLeafNode(node.op);
                toDot(node.T);
                makeEdge(node, node.E);
                makeEdge(node, node.op);
                makeEdge(node, node.T);
                break;
            }
            case 4: {
                // E => T
                labelNode(node, "E");
                toDot(node.T);
                makeEdge(node, node.T);
                break;
            }
            case 5:
            case 6: {
                // T => T * F | T / F
                labelNode(node, "T");
                toDot(node.T);
                labelLeafNode(node.op);
                toDot(node.F);
                makeEdge(node, node.T);
                makeEdge(node, node.op);
                makeEdge(node, node.F);
                break;
            }
            case 7: {
                // T => F
                labelNode(node, "T");
                toDot(node.F);
                makeEdge(node, node.F);
                break;
            }
            case 8: {
                // F => ( E )
                labelNode(node, "F");
                labelLeafNode(node.lp);
                toDot(node.E);
                labelLeafNode(node.rp);
                makeEdge(node, node.lp);
                makeEdge(node, node.E);
                makeEdge(node, node.rp);
                break;
            }
            case 9: {
                // F => digit
                labelNode(node, "F");
                toDot(node.digit);
                makeEdge(node, node.digit);
                break;
            }
            case 10: {
                // digit => '0' | ... | '9'
                labelLeafNode(node);
                return;
            }
            // Should never get here...
            default: throw new Error("Unimplemented node types ");
        }
    };
    let appendHeader = function () {
        buffer += "digraph G{\n";
    };
    let appendFooter = function () {
        buffer += "}\n";
    };

    let graph = {
        dotString: function () {
            let bufferCopy = new String(buffer);
            buffer = "";
            return bufferCopy.toString();
        },
        build: function (node) {
            appendHeader();
            toDot(node);
            appendFooter();
        },
    }
    return graph;
})();

// Builds a graph in graphviz dot language, for the sdd 5.4
let Graph5dot4 = (function() {
    let buffer = "";
    let labelNode = function (node) {
        switch (node.type) {
            // Nodes: L, E, T, F
            case 1: case 2: case 5: case 8: case 9: {
                buffer += `\t${node.id.toString()} ${makeTable(node, "val")}\n`;
                break;
            }
            // Nodes: E', T'
            case 3: case 4: case 6: case 7: {
                buffer += `\t${node.id.toString()} ${makeTable(node, "inh", "syn")}\n`;
                break;
            }
            // Nodes: +,-,*,/,(,),ε
            case 10: case 11: case 12: case 13: case 14: case 15: {
                buffer += `\t${node.id.toString()} ${makeTable(node)}\n`;
                break;
            }
            // Node: NUMBER
            case 16: {
                buffer += `\t${node.id.toString()} ${makeTable(node, "lexval")}\n`;
                break;
            }
            default: {
                // Should never get here.
                throw new Error("unimplemented node type " + node.type);
            }
        }
    };
    let getAttributes = function (node,...attrs) {
        let attrList = {};
        for (let attr of attrs) {
            if (node.hasOwnProperty(attr)) {
                attrList[attr] = node[attr];
            }
        }
        return attrList;
    };
    let makeTable = function(node, ...attrs) {
        let table = '[label = <<TABLE ALIGN="CENTER">';
        table += `\t<TR><TD>${node.name}</TD></TR>\n`;
        let attrList = getAttributes(node, ...attrs);
        Object.keys(attrList).forEach(key => {
            table += `\t<TR><TD>${key} = ${node[key]}</TD></TR>\n`;
        });
        table += '</TABLE>>, ];';
        return table;
    }

    let makeEdge = function (fromNode, toNode) {
        buffer +=`\t${fromNode.id.toString()} -> ${toNode.id.toString()};\n`;
    };

    let toDot = function (node) {
        switch (node.type) {
            // L -> E
            case 1: {
                labelNode(node);
                makeEdge(node, node.E);
                toDot(node.E);
                break;
            }
            // E -> T Ep
            case 2: {
                labelNode(node);
                makeEdge(node, node.T);
                makeEdge(node, node.Ep);
                toDot(node.T);
                toDot(node.Ep);
                break;
            }
            // Ep -> ('+'|'-') T Ep
            case 3: {
                labelNode(node.op);
                makeEdge(node, node.op);
                labelNode(node);
                makeEdge(node, node.T);
                makeEdge(node, node.Ep);
                toDot(node.T);
                toDot(node.Ep);
                break;
            }
            case 4: case 7: {
                labelNode(node);
                labelNode(node.epsilonNode);
                makeEdge(node, node.epsilonNode);
                break;
            }
            // T -> F Tp
            case 5: {
                labelNode(node);
                makeEdge(node, node.F);
                makeEdge(node, node.Tp);
                toDot(node.F);
                toDot(node.Tp);
                break;
            }
            // Tp -> ('*'|'/') F Tp
            case 6: {
                labelNode(node);
                labelNode(node.op);
                makeEdge(node, node.op);
                makeEdge(node, node.F);
                makeEdge(node, node.Tp);
                toDot(node.F);
                toDot(node.Tp);
                break;
            }
            // F -> '(' E ')'
            case 8: {
                labelNode(node);
                labelNode(node.lp);
                makeEdge(node, node.lp);
                toDot(node.E);
                labelNode(node.rp);
                makeEdge(node, node.rp);
                makeEdge(node, node.E);
                break;
            }
            // F -> NUMBER
            case 9: {
                labelNode(node);
                labelNode(node.digitNode);
                makeEdge(node, node.digitNode);
                break;
            }
            default: console.log("Unimplemented node type " + node.type);
        }
    };

    let appendHeader = function () {
        buffer += "digraph G{\n";
        buffer += "node [shape=plaintext, fontsize=20];"
    };
    let appendFooter = function () {
        buffer += "}\n";
    };

    let graph = {
        dotString: function () {
            let bufferCopy = new String(buffer);
            buffer = "";
            return bufferCopy.toString();
        },
        build: function (node) {
            appendHeader();
            toDot(node);
            appendFooter();
        },
    }
    return graph;
})();

// This function annotates the parse tree with attributes(synthetized or inherited).
// To inherit an attribute we just define that attribute from the parent or a sibling of that node.
// As a general rule we will define inherited attributes with preorder actions and
// synthesize them when doing postorder actions on each node.
function annotateTree(node) {
    // We can use the property 'type' of each node to distinguish the between nodes.
    switch (node.type) {
        // L -> E
        case 1: {
            // pre-order actions.
            annotateTree(node.E);

            // post-order actions.
            // { L.val = E.val }
            node.val = node.E.val;
            break;
        }
        // E -> T E'
        case 2: {
            // pro-order actions.
            annotateTree(node.T);
            // { E'.inh = T.val }
            node.Ep.inh = node.T.val;
            annotateTree(node.Ep);

            // post-order actions.
            // { E.val = E'.syn }
            node.val = node.Ep.syn;
            break;
        }
        // E' -> ('+'|'-') T E'
        case 3: {
            // pre-order actions.
            annotateTree(node.T);
            // { E1'.inh = E'.inh ('+'|'-') T.val }
            node.Ep.inh = node.op.name === "+"
                            ? node.inh + node.T.val
                            : node.inh - node.T.val;
            annotateTree(node.Ep);

            // post-order actions.
            // { E'.syn = E1'.syn }
            node.syn = node.Ep.syn;
            break;
        }
        // E' -> ε
        case 4: {
            // in-order actions.
            // { E'.syn = E'.inh }
            node.syn = node.inh;
            break;
        }
        // T -> F T'
        case 5: {
            // pre-order actions.
            annotateTree(node.F);
            // { T'.inh = F.val }
            node.Tp.inh = node.F.val;
            annotateTree(node.Tp);

            // post-order actions.
            // { T.val = T'.syn }
            node.val = node.Tp.syn;
            break;
        }
        // T' -> ('*'|'/') F T'
        case 6: {
            // pre-order actions.
            annotateTree(node.F);
            // { T1'.inh = T'.inh ('*'|'/') T.val }
            node.Tp.inh = node.op.name === "*"
                            ? node.inh * node.F.val
                            : node.inh / node.F.val;
            annotateTree(node.Tp);

            // post-order actions.
            // { T'.syn = T1'.syn }
            node.syn = node.Tp.syn;
            break;
        }
        // T' -> ε
        case 7: {
            // in-order actions.
            // { T'.syn = T'.inh }
            node.syn = node.inh;
            break;
        }
        // F -> '(' E ')'
        case 8: {
            // pre-order actions.
            annotateTree(node.E);

            // post-order actions.
            node.val = node.E.val;
            break;
        }
        // F -> digit  { F.val = digit.lexval }
        case 9: {
            // in-order actions.
            node.val = Number(node.digitNode.lexval);
            break;
        }
        default: {
            throw new Error("unimplemented node type " + node.type);
        }
    }
}