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
    console.log('onGet:', this.lastToken)
    return this.lastToken
  }
  last() {
    return this.lastToken
  }
  getToken() {
    while (this.char.match(/\s/))
      this.nextChar

    if (this.char == '/') {
      // One line comment
      if (this.char == '/') {
        while (this.nextChar.match(/[^\n\0]/)) {}

        if (this.char == '\0')
          return Token.Eof
        return this.getToken()
      }
      // Multis line comment
      else if (this.char == '*') {
        do {
          while (this.nextChar != '*')
            if (this.char == '\0')
              return Token.Eof
        } while(this.nextChar != '/')
      } else
        this.cursor--
    }

    if (this.char == '{') {
      this.nextChar
      return Token.LeftBrace
    }

    if (this.char == '}') {
      this.nextChar
      return Token.RightBrace
    }

    if (this.char == ':') {
      this.nextChar
      return Token.Colon
    }

    if (this.char == '"') {
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

    if (this.char.match(/[\w_.+-]/)) {
      this.identifier = this.char
      while (this.nextChar.match(/[\w_.]/))
        this.identifier += this.char
      return Token.Identifier
    }

    return Token.Eof
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

function parseElements(lex, root) {
  // lex = Lexer
  // root = array of StringTree

  if (lex.last() != Token.LeftBrace)
    return;
  lex.get()

  while(lex.last() != Token.RightBrace) {
    let node = new StringTree
    root.add(node)

    if (lex.last() == Token.LeftBrace) {
      parseElements(lex, node)
      lex.get()
    } else if (lex.last() == Token.Identifier) {
      node.setName(lex.identifier)

      if (lex.get() == Token.Colon) {
        lex.get()
        parseElements(lex, node)
        lex.get()
      }
    } else if (lex.last() == Token.Eof)
      return;
  }
}


class StringTreeParser {
  parseString(str) {
    let lex = new Lexer(str)
    lex.get()
    let node = new StringTree
    parseElements(lex, node)
    return node
  }

  parseFile(path) {
    try {
      const buffer = fs.readFileSync('../examples/tree.txt')
      return parseString(buffer.toString())
    } catch(err) {
      return
    }
  }
}
