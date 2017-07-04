export = class Tree extends Array<Tree> {
  name: string = ''
  get(id: string | number): Tree | null {
    if (typeof id == 'number') return this[id]
    for (let child of this)
      if (child.name === id) return child
    return null
  }
  getAll(id: string): Tree[] {
    let children: Tree[] = []
    for (let child of this)
      if (child.name === id) children.push(child)
    return children
  }
  get int(): number {return parseInt(this.name)}
  get float(): number {return parseFloat(this.name)}
  get bool(): boolean {return this.name == 'true'}
  get string(): string {return this.name}
  toJSON(): Object {return {children: this, name: this.name}}
}
