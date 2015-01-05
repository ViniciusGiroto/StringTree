#include "stringtree.h"
#include <cstdio>
#include <cstdlib>

namespace
{

struct Token
{
    enum Kind
    {
        Identifier, // str | "str"
        LeftBrace,  // {
        RightBrace, // }
        Colon,      // :
        Undefined,
        Eof
    };
    Kind value;
    size_t line;
    size_t pos;
    
    Token():value(Undefined) {}
    Token(Kind value):value(value) {}
    
    operator Kind() const { return value; }
};

class Lexer
{
    const std::string & str;
    char last_char;
    Token last_token;
    size_t cursor;
    
    std::string m_identifier;
    size_t m_currentLine;
    size_t m_linePos;
    
    char getchar();
    Token gettok();
    
public:
    Lexer(const std::string & str);
    
    Token get();
    
    const Token last() const { return last_token; }
    const std::string identifier() const { return m_identifier; }
};

Lexer::Lexer(const std::string & str):
    str(str),
    last_char(' '),
    last_token(),
    cursor(0),
    m_identifier(),
    m_currentLine(0),
    m_linePos(0)
{
}

char Lexer::getchar()
{
    if(cursor < str.length())
        return str[cursor++];
    return '\0';
}

Token Lexer::get()
{
    return last_token = gettok();
}

Token Lexer::gettok()
{
    // Skip spaces
    while( isspace(last_char) || last_char == '\n' || last_char == '\t' )
    {
        last_char = getchar();
    }
    
    // Skip comments
    if(last_char == '/')
    {
        last_char = getchar();
        // One line comment
        if(last_char == '/')
        {
            while( last_char != '\n' && last_char != '\0' )
                last_char = getchar();
            
            if(last_char != '\0')
                return gettok();
            else
                return Token::Eof;
        }
        else
        // Multi lines comment
        if(last_char == '*')
        {
            do {
                while( (last_char = getchar()) != '*' )
                {
                    if(last_char == '\0')
                        return Token::Eof;
                }
            } while( (last_char = getchar()) != '/' );
            last_char = getchar();
            return gettok();
        }
        else
            cursor--;
    }
    
    if(last_char == '{')
    {
        last_char = getchar();
        return Token::LeftBrace;
    }
    if(last_char == '}')
    {
        last_char = getchar();
        return Token::RightBrace;
    }
    if(last_char == ':')
    {
        last_char = getchar();
        return Token::Colon;
    }
    
    if(last_char == '"')
    {
        m_identifier.clear();
            
        while((last_char = getchar()) != '"')
        {
            if(last_char == '\\')
            {
                last_char = getchar();
                if(last_char == '"')
                    m_identifier += '"';
                else if(last_char == 'n')
                    m_identifier += '\n';
                else
                {
                    m_identifier += '\\';
                    m_identifier += last_char;
                }
            }
            m_identifier += last_char;
        }
        last_char = getchar();
        return Token::Identifier;
    }
    
    if(isalnum(last_char) || last_char == '_' || last_char == '.' || last_char == '-' || last_char == '+')
    {
        m_identifier = last_char;
        while(isalnum(last_char = getchar()) || last_char == '_' || last_char == '.')
        {
            m_identifier += last_char;
        }
        return Token::Identifier;
    }
    
    return Token::Eof;
}

}

StringTree::~StringTree()
{
    for(StringTree * node: m_elements)
        delete node;
}

const std::string & StringTree::name() const
{
    return m_name;
}

const std::vector<StringTree*> & StringTree::childs() const
{
    return m_elements;
}

void StringTree::setName(const std::string & str)
{
    m_name = str;
}

void StringTree::add(StringTree * element)
{
    m_elements.push_back(element);
}

int StringTree::asInt() const
{
    return atoi(m_name.c_str());
}

float StringTree::asFloat() const
{
    return atof(m_name.c_str());
}

bool StringTree::asBool() const
{
    if(m_name == "true") return true;
    return false;
}



void parseElements(Lexer & lex, StringTree * root)
{
    if(lex.last() != Token::LeftBrace)
    {
        return;
    }
    lex.get();
    
    while(lex.last() != Token::RightBrace)
    {
        StringTree * node = new StringTree;
        root->add(node);
        
        if(lex.last() == Token::LeftBrace)
        {
            parseElements(lex, node);
            lex.get();
        }
        else if(lex.last() == Token::Identifier)
        {
            node->setName(lex.identifier());
            
            if(lex.get() == Token::Colon)
            {
                lex.get();
                parseElements(lex, node);
                lex.get();
            }
        }
        else if(lex.last() == Token::Eof)
        {
            return;
        }
    }
}

StringTree * StringTreeParser::parseString(const std::string & str)
{
    Lexer lex(str);
    lex.get();
    StringTree * node = new StringTree;
    parseElements(lex, node);
    return node;
}

StringTree * StringTreeParser::parseFile(const std::string & fname)
{
    FILE * f = fopen(fname.c_str(), "r");
    
    if(!f)
        return nullptr;
    
    std::string str;
    int c;
    while( (c = fgetc(f)) != EOF )
        str.push_back(c);
    fclose(f);
    
    return parseString(str);
}
