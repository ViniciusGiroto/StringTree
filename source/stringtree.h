#ifndef ONIDEV_STRING_TREE_H_INCLUDED
#define ONIDEV_STRING_TREE_H_INCLUDED

#include <string>
#include <vector>

class StringTree
{
    friend class StringTreeParser;
    std::string m_name;
    std::vector<StringTree*> m_elements;
    
public:
    ~StringTree();
    const std::string & name() const;
    const std::vector<StringTree*> & childs() const;
    
    void setName(const std::string & str);
    void add(StringTree * element);
    //@todo remove(int i);
    
    int asInt() const;
    float asFloat() const;
    bool asBool() const;
};

class StringTreeParser
{
public:
    StringTree * parseString(const std::string & str);
    StringTree * parseFile(const std::string & fname);
};

#endif
