// biome-ignore-all lint/suspicious/noShadow: type parameters inherently reuse names across sibling type aliases

declare const tags: unique symbol

export type Tag<BaseType, Tag extends PropertyKey, Metadata = void> = BaseType & {
    [tags]: { [K in Tag]: Metadata }
}
