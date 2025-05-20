import { range } from '../helpers/range'
import { RadixTreeNode } from './RadixTreeNode'

export interface RadixTreeKey<RawType, SliceType> {
    value: RawType

    [Symbol.iterator](): Iterator<SliceType>
}

// TODO: Refactor `RadixTree` class to use any type of key (current implementation only supports string indexes)
// TODO: Case study: Which data types are sliceable and can be used as keys? And how?

/**
 * A radix tree (or Patricia trie) is a space-optimized trie data structure where each node with
 * multiple children is merged into a single node. It is used to store a dynamic set of strings
 * where keys are usually strings. The tree is built from the root node down to the leaves, and
 * each node represents a common prefix of the keys stored in the tree. The tree is used to
 * efficiently search for keys, insert new keys, and delete existing keys. The tree is also used
 * to find the longest common prefix of a set of keys, which is useful in applications such as
 * autocomplete and spell checking.
 *
 * @template Value The type of the value stored in the tree.
 */
export class RadixTree<Value> {
    public root: RadixTreeNode<string, Value>
    public constructor()
    public constructor(data: Record<string, Value>)
    public constructor(root: RadixTreeNode<string, Value>)

    public constructor(data?: Record<string, Value> | RadixTreeNode<string, Value>) {
        if (data instanceof RadixTreeNode) {
            this.root = data
            return this
        }

        this.root = new RadixTreeNode<string, Value>('')

        if (data) for (const [key, value] of Object.entries(data)) this.addNode(key, value)
    }

    public addNode(key: string, value: Value) {
        RadixTree.addNode(this.root, key, value)
    }

    public static addNode<Value>(root: RadixTreeNode<string, Value>, key: string, value: Value) {
        if (root.children.length === 0) {
            const prefix = key.slice(RadixTree.findCommonPrefix(key, root.prefix))
            const node = new RadixTreeNode(prefix, value)
            root.children.push(node)

            return
        }

        for (const i of range(root.children.length)) {
            const node = root.children[i]!

            const commonPrefixLength = RadixTree.findCommonPrefix(key, node.prefix)

            if (commonPrefixLength > 0) {
                if (commonPrefixLength < node.prefix.length) {
                    const newBaseNode = new RadixTreeNode<string, Value>(
                        node.prefix.slice(0, commonPrefixLength)
                    )
                    const updatedNode = new RadixTreeNode<string, Value>(
                        node.prefix.slice(commonPrefixLength),
                        node.value!,
                        node.children
                    )
                    const newNode = new RadixTreeNode(key.slice(commonPrefixLength), value)

                    const ord = updatedNode.prefix.localeCompare(newNode.prefix)

                    if (ord > 0) newBaseNode.children.push(newNode, updatedNode)
                    else newBaseNode.children.push(updatedNode, newNode)

                    root.children[i] = newBaseNode

                    return
                }

                if (node.prefix.length === key.length) {
                    node.value = value
                    return
                }

                return void this.addNode(node, key.slice(commonPrefixLength), value)
            }
        }

        const newNode = new RadixTreeNode(key, value)
        root.children.push(newNode)
    }

    public removeNode(key: string): boolean {
        return RadixTree.removeNode(this.root, key)
    }

    public static removeNode<Value>(tree: RadixTreeNode<string, Value>, key: string): boolean {
        if (tree.children.length === 0) return false

        if (!this.hasIndex(tree, key)) return false

        const node = tree.children.find(
            node => this.findCommonPrefix(node.prefix, key) === node.prefix.length
        )

        if (!node) throw new Error('tree has index but no root node was found')

        if (node.prefix.length !== key.length)
            return this.removeNode(node, key.slice(node.prefix.length))

        if (node.children.length > 0) {
            node.value = null

            return true
        }

        const index = tree.children.indexOf(node)

        if (index === -1) throw new Error('Node not found in children')

        tree.children.splice(index, 1)

        return true
    }

    public setNodeValue(key: string, value: Value): boolean {
        return RadixTree.setNodeValue<Value>(this.root, key, value)
    }

    public static setNodeValue<Value>(
        tree: RadixTreeNode<string, Value>,
        key: string,
        value: Value
    ): boolean {
        if (tree.children.length === 0) return false

        if (!this.hasIndex(tree, key)) return false

        const node = tree.children.find(
            node => this.findCommonPrefix(node.prefix, key) === node.prefix.length
        )

        if (!node) throw new Error('tree has index but no root node was found')

        if (node.prefix.length !== key.length)
            return this.setNodeValue(node, key.slice(node.prefix.length), value)

        node.value = value

        return true
    }

    private static findCommonPrefix = (a: string, b: string) => {
        let i = 0

        while (i < a.length && i < b.length && a[i] === b[i]) ++i

        return i
    }

    public static findByIndex<Value>(
        root: RadixTreeNode<string, Value>,
        index: string
    ): Value | null {
        if (root.children.length === 0) return null

        const node = root.children.find(
            node => RadixTree.findCommonPrefix(node.prefix, index) === node.prefix.length
        )

        if (!node) return null

        if (node.prefix.length === index.length) {
            if (node.prefix === index) return node.value

            return null
        }
        return this.findByIndex(node, index.slice(node.prefix.length))
    }

    public findByIndex(index: string): Value | null {
        return RadixTree.findByIndex(this.root, index)
    }

    public static hasIndex<Value>(root: RadixTreeNode<string, Value>, index: string): boolean
    public static hasIndex<Value>(root: RadixTree<Value>, index: string): boolean

    public static hasIndex<Value>(
        root: RadixTree<Value> | RadixTreeNode<string, Value>,
        index: string
    ): boolean {
        if (root instanceof RadixTree) root = root.root

        if (root.children.length === 0) return false

        const node = root.children.find(
            node => RadixTree.findCommonPrefix(node.prefix, index) === node.prefix.length
        )

        if (!node) return false

        if (node.prefix.length === index.length) {
            if (node.prefix === index) return node.value !== null

            return false
        }
        return this.hasIndex(node, index.slice(node.prefix.length))
    }

    public hasIndex(index: string): boolean {
        return RadixTree.hasIndex(this.root, index)
    }

    public static mergeTrees<Value>(...trees: RadixTree<Value>[]): RadixTree<Value>
    public static mergeTrees<Value>(...nodes: RadixTreeNode<string, Value>[]): RadixTree<Value>

    public static mergeTrees(
        ...trees_nodes: (RadixTree<any> | RadixTreeNode<string, any>)[]
    ): RadixTree<any> {
        return new RadixTree<any>().merge(...trees_nodes)
    }

    public merge(...trees: (RadixTree<Value> | RadixTreeNode<string, Value>)[]) {
        if (trees.length === 0) throw new Error('No trees or nodes to merge together')

        for (const item of trees) {
            RadixTree.getEntries(item).forEach(([key, value]) => this.addNode(key, value))
        }

        return this
    }

    private static getKeys<Value>(tree: RadixTree<Value>): string[]
    private static getKeys<Value>(root: RadixTreeNode<string, Value>, prefix: string): string[]
    private static getKeys<Value>(root: RadixTreeNode<string, Value>): string[]
    private static getKeys<Value>(
        root: RadixTree<Value> | RadixTreeNode<string, Value>,
        prefix?: string
    ): string[]

    private static getKeys(
        tree: RadixTree<any> | RadixTreeNode<string, any>,
        prefix: string = ''
    ): string[] {
        if (tree instanceof RadixTree) return this.getEntries(tree).map(([k]) => k)

        return this.getEntries(tree, prefix).map(([k]) => k)
    }

    private static getValues<Value>(tree: RadixTree<Value>): Value[]
    private static getValues<Value>(root: RadixTreeNode<string, Value>, prefix: string): Value[]
    private static getValues<Value>(root: RadixTreeNode<string, Value>): Value[]
    private static getValues<Value>(
        root: RadixTree<Value> | RadixTreeNode<string, Value>,
        prefix?: string
    ): Value[]

    private static getValues(
        tree: RadixTree<any> | RadixTreeNode<string, any>,
        prefix: string = ''
    ): any[] {
        if (tree instanceof RadixTree) return this.getEntries(tree).map(([, v]) => v)

        return this.getEntries(tree, prefix).map(([, v]) => v)
    }
    private static getEntries<Value>(tree: RadixTree<Value>): [string, Value][]
    private static getEntries<Value>(
        root: RadixTreeNode<string, Value>,
        prefix: string
    ): [string, Value][]
    private static getEntries<Value>(root: RadixTreeNode<string, Value>): [string, Value][]
    private static getEntries<Value>(
        root: RadixTree<Value> | RadixTreeNode<string, Value>,
        prefix?: string
    ): [string, Value][]

    private static getEntries(
        tree: RadixTree<any> | RadixTreeNode<string, any>,
        prefix: string = ''
    ): [string, any][] {
        const map = new Map<string, any>()

        if (tree instanceof RadixTreeNode) {
            for (const child of tree.children) {
                const currentPrefix = prefix + child.prefix

                if (child.value !== null) {
                    map.set(currentPrefix, child.value)
                    if (child.children.length > 0)
                        this.getEntries(child, currentPrefix).forEach(([k, v]) => map.set(k, v))
                } else if (child.children.length > 0)
                    this.getEntries(child, currentPrefix).forEach(([k, v]) => map.set(k, v))
                else map.set(currentPrefix, child.value)
            }
        } else if (tree instanceof RadixTree) {
            this.getEntries(tree.root, prefix).forEach(([k, v]) => map.set(k, v))
        } else {
            throw new Error('Invalid tree or node')
        }

        return new Array(...map.entries())
    }

    public keys(): string[] {
        return RadixTree.getKeys(this)
    }
    public entries(): [string, Value][] {
        return RadixTree.getEntries(this)
    }
    public values(): Value[] {
        return RadixTree.getValues(this)
    }
}
