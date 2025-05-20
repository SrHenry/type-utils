export class RadixTreeNode<Key, Value> {
    public prefix: Key
    public children: RadixTreeNode<Key, Value>[]

    public value: Value | null = null

    public constructor(prefix: Key)
    public constructor(prefix: Key, value: Value)
    public constructor(prefix: Key, value: Value, children: RadixTreeNode<Key, Value>[])

    public constructor(
        prefix: Key,
        value: Value | null = null,
        children: RadixTreeNode<Key, Value>[] = []
    ) {
        this.prefix = prefix
        this.value = value
        this.children = children
    }
}
