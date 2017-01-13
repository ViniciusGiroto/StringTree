const fs = require('fs')

class Enum {
  constructor(...e) {
    for (let name of e)
      this[name] = Symbol(name)
  }
}

const Token = new Enum(
  'Identifier', // str | "str"
  'LeftBrace',  // {
  'RightBrace', // }
  'Colon',      // :
  'Undefined',
  'EOF'
)

// for performance
const RegExps = {
  Space: /\s/,
  OneLineComment: /[^\n\0]/,
  Identifier1stChar: /[\w_.+-]/,
  IdentifierChar: /[\w_.]/
}

class Lexer {
  constructor(str) {
    this.str = str
    this.lastChar = ' '
    this.lastToken = null
    this.cursor = 0
    this.identifier = null
  }
  nextToken() {
    return (this.lastToken = this.getToken())
  }
  getToken() {
    // Skip spaces
    while (RegExps.Space.test(this.lastChar))
      this.nextChar

    switch(this.lastChar) {
      // Skip comments
      case '/': {
        // One line comment
        if (this.nextChar == '/') {
          while (RegExps.OneLineComment.test(this.nextChar));

          if (this.lastChar == '\0')
            return Token.EOF
          return this.getToken()
        }
        // Multi lines comment
        else if (this.lastChar == '*') {
          do {
            while (this.nextChar != '*')
              if (this.lastChar == '\0')
                return Token.EOF
          } while(this.nextChar != '/')
        } else
          this.cursor--
          break
      }
      case '{': {
        this.nextChar
        return Token.LeftBrace
      }
      case '}': {
        this.nextChar
        return Token.RightBrace
      }
      case ':': {
        this.nextChar
        return Token.Colon
      }
      case '"': {
        this.identifier = ''

        while (this.nextChar != '"') {
          if (this.lastChar == '\\')
            if (this.nextChar == '"')
              this.identifier += '"'
            else if (this.lastChar == 'n')
              this.identifier += '\n'
            else
              this.identifier += '\\' + this.lastChar
          this.identifier += this.lastChar
        }

        this.nextChar
        return Token.Identifier
      }
      default: {
        if (RegExps.Identifier1stChar.test(this.lastChar)) {
          this.identifier = this.lastChar
          while (RegExps.IdentifierChar.test(this.nextChar))
            this.identifier += this.lastChar
          return Token.Identifier
        }

        return Token.EOF
      }
    }
  }
  get char() {
    return this.lastChar
  }
  get nextChar() {
    return (this.lastChar = (this.str[this.cursor++] || '\0'))
  }
}

class StringTree {
  constructor() {
    this._name = ''
    this._children = []
  }
  get(id) {
    if (typeof id == 'number')
      return this.getChildren()[id]
    for (let child of this.getChildren())
      if (child.getName() === id) return child
  }
  getAll(id) {
    let children = []
    for (let child of this.getChildren())
      if (child.getName() === id) children.push(child)
    return children
  }
  setName(str) {
    this._name = str
  }
  getName() {
    return this._name
  }
  getChildren() {
    return this._children
  }
  add(element) {
    this._children.push(element)
  }
  asInt() {
    return parseInt(this.getName())
  }
  asFloat() {
    return parseFloat(this.getName())
  }
  asBool() {
    return this.getName() == 'true'
  }
  toJSON() {
    return {children: this.getChildren(), name: this.getName()}
  }
}

class StringTreeParser {
  static parseElements(lex, root) {
    // lex = Lexer
    // root = array of StringTree

    if (lex.lastToken != Token.LeftBrace)
      return;
    lex.nextToken()

    while(lex.lastToken != Token.RightBrace) {
      let node = new StringTree
      root.add(node)

      if (lex.lastToken == Token.LeftBrace) {
        this.parseElements(lex, node)
        lex.nextToken()
      } else if (lex.lastToken == Token.Identifier) {
        node.setName(lex.identifier)

        if (lex.nextToken() == Token.Colon) {
          lex.nextToken()
          this.parseElements(lex, node)
          lex.nextToken()
        }
      } else if (lex.lastToken == Token.EOF)
        return
    }
  }

  static parseString(str) {
    let lex = new Lexer(str)
    lex.nextToken()
    if (lex.lastToken == Token.EOF)
      return
    let node = new StringTree
    this.parseElements(lex, node)
    return node
  }

  static parseFile(path) {
    try {
      return this.parseString(fs.readFileSync(path).toString())
    } catch(err) {
      return err
    }
  }
}

module.exports = StringTreeParser
