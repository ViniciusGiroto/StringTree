const time = Date.now()
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
  'Eof'
)

// for performance
const RegExps = Object.freeze({
  Space: /\s/,
  OneLineComment: /[^\n\0]/,
  Identifier1stChar: /[\w_.+-]/,
  IdentifierChar: /[\w_.]/
})

class Lexer {
  constructor(str) {
    this.str = str
    this.lastChar = ' '
    this.lastToken = null
    this.cursor = 0
    this.identifier = null
  }
  get() {
    this.lastToken = this.getToken()
    return this.lastToken
  }
  last() {
    return this.lastToken
  }
  getToken() {
    while (RegExps.Space.test(this.char)) {this.nextChar};

    switch(this.char) {
      case '/': {
        // One line comment
        if (this.nextChar == '/') {
          while (RegExps.OneLineComment.test(this.nextChar));

          if (this.char == '\0')
            return Token.Eof
          return this.getToken()
        }
        // Multi lines comment
        else if (this.char == '*') {
          do {
            while (this.nextChar != '*')
              if (this.char == '\0')
                return Token.Eof
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
          if (this.char == '\\')
            if (this.nextChar == '"')
              this.identifier += '"'
            else if (this.char == 'n')
              this.identifier += '\n'
            else
              this.identifier += '\\' + this.char
          this.identifier += this.char
        }

        this.nextChar
        return Token.Identifier
      }
      default: {
        if (RegExps.Identifier1stChar.test(this.char)) {
          this.identifier = this.char
          while (RegExps.IdentifierChar.test(this.nextChar))
            this.identifier += this.char
          return Token.Identifier
        }

        return Token.Eof
      }
    }
  }
  get char() {
    return this.lastChar
  }
  get token() {
    return this.lastToken
  }
  get nextChar() {
    if (this.cursor < this.str.length)
      return this.lastChar = this.str[this.cursor++]
    return '\0'
  }
}

class StringTree {
  constructor() {
    this._name = ''
    this._children = []
  }
  get(id) {
    for (let child of this.getChildren())
      if (child.getName() === id) return child
  }
  getAll() {
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

    if (lex.last() != Token.LeftBrace)
      return;
    lex.get()

    while(lex.last() != Token.RightBrace) {
      let node = new StringTree
      root.add(node)

      if (lex.last() == Token.LeftBrace) {
        this.parseElements(lex, node)
        lex.get()
      } else if (lex.last() == Token.Identifier) {
        node.setName(lex.identifier)

        if (lex.get() == Token.Colon) {
          lex.get()
          this.parseElements(lex, node)
          lex.get()
        }
      } else if (lex.last() == Token.Eof)
        return;
    }
  }

  static parseString(str) {
    let lex = new Lexer(str)
    lex.get()
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

///home/vinicius/.steam/steam/steamapps/common/Planet Centauri/assets/moddable/Chests/chests.txt
parse = StringTreeParser.parseFile('../examples/tree.txt')

console.log(JSON.stringify(parse.get('Craft'), null, 2))
console.log(Date.now() - time)
