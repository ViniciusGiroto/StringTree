"use strict";
module.exports = class Tree extends Array {
    constructor() {
        super(...arguments);
        this.name = '';
    }
    get(id) {
        if (typeof id == 'number')
            return this[id];
        for (let child of this)
            if (child.name === id)
                return child;
        return null;
    }
    getAll(id) {
        let children = [];
        for (let child of this)
            if (child.name === id)
                children.push(child);
        return children;
    }
    get int() { return parseInt(this.name); }
    get float() { return parseFloat(this.name); }
    get bool() { return this.name == 'true'; }
    get string() { return this.name; }
    toJSON() { return { children: this, name: this.name }; }
};
//# sourceMappingURL=Tree.js.map