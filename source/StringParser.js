"use strict";
const Tree = require("./Tree");
class Lexer {
    constructor(str) {
        this.char = ' ';
        this.cursor = 0;
        this.str = str;
    }
    nextChar() { return this.char = (this.str[this.cursor++] || '\0'); }
    nextToken() { return this.token = this.getToken(); }
    getToken() {
        // Skip spaces
        while (/\s/.test(this.char))
            this.nextChar();
        // Skip comments
        if (this.char == '/') {
            // One line comment
            if (this.nextChar() == '/') {
                while (this.char != '\n' && this.char != '\0')
                    this.nextChar();
                if (this.char == '\0')
                    return 'EOF';
                return this.nextToken();
            }
            else if (this.char == '*') {
                do {
                    while (this.nextChar() != '*')
                        if (this.char == '\0')
                            return 'EOF';
                } while (this.nextChar() != '/');
                this.nextChar();
                return this.nextToken();
            }
            else
                this.cursor--;
        }
        if (this.char == '{') {
            this.nextChar();
            return 'LEFT_BRACE';
        }
        if (this.char == '}') {
            this.nextChar();
            return 'RIGHT_BRACE';
        }
        if (this.char == ':') {
            this.nextChar();
            return 'COLON';
        }
        if (this.char == '"') {
            this.identifier = '';
            while (this.nextChar() != '"') {
                if (this.char == '\\') {
                    if (this.nextChar() == '"')
                        this.identifier += '"';
                    else if (this.char == 'n')
                        this.identifier += '\n';
                    else
                        this.identifier += '\\' + this.char;
                }
                this.identifier += this.char;
            }
            this.nextChar();
            return 'IDENTIFIER';
        }
        if (/[\w_.+-]/.test(this.char)) {
            this.identifier = this.char;
            while (/[\w_.]/.test(this.nextChar()))
                this.identifier += this.char;
            return 'IDENTIFIER';
        }
        return 'EOF';
    }
}
function parseElements(lex, root) {
    if (lex.token != 'LEFT_BRACE')
        return;
    lex.nextToken();
    while (lex.token != 'RIGHT_BRACE') {
        let node = new Tree;
        root.push(node);
        if (lex.token == 'LEFT_BRACE') {
            parseElements(lex, node);
            lex.nextToken();
        }
        else if (lex.token == 'IDENTIFIER') {
            node.name = lex.identifier;
            if (lex.nextToken() == 'COLON') {
                lex.nextToken();
                parseElements(lex, node);
                lex.nextToken();
            }
        }
        else if (lex.token == 'EOF')
            return;
    }
}
module.exports = function parseString(str) {
    let lex = new Lexer(str);
    lex.nextToken();
    if (lex.token == 'EOF')
        return null;
    let node = new Tree;
    parseElements(lex, node);
    return node;
};
//# sourceMappingURL=StringParser.js.map