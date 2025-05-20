import { RadixTree } from '../RadixTree'

describe('RadixTree methods:', () => {
    it('RadixTree.hasIndex', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        expect(tree.hasIndex('')).toBe(false)
        expect(tree.hasIndex('/foo')).toBe(false)
        expect(tree.hasIndex('/bar')).toBe(false)

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        expect(tree.hasIndex('')).toBe(false)
        expect(tree.hasIndex('/foo')).toBe(false)
        expect(tree.hasIndex('/bar')).toBe(false)

        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/hom')).toBe(false)
        expect(tree.hasIndex('/home')).toBe(true)
        expect(tree.hasIndex('/setings')).toBe(false)
        expect(tree.hasIndex('/settings')).toBe(true)
    })

    it('RadixTree.keys', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        const keys = tree.keys()

        expect(keys).toBeInstanceOf(Array)
        expect(keys).not.toHaveLength(0)
        expect(keys).toHaveLength(3)
        expect(keys).not.toContain('')
        expect(keys).toContain('/')
        expect(keys).toContain('/home')
        expect(keys).toContain('/settings')
    })

    it('RadixTree.values', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        const values = tree.values()

        expect(values).toBeInstanceOf(Array)
        expect(values).not.toHaveLength(0)
        expect(values).toHaveLength(3)
        expect(values.map(e => typeof e).every(type => type === 'function')).toBe(true)
    })

    it('RadixTree.entries', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        const entries = tree.entries()

        const router: Record<string, Function> = entries.reduce(
            (o, [k, v]) => Object.assign(o, { [k]: v }),
            {}
        )

        expect(entries).toBeInstanceOf(Array)
        expect(entries).not.toHaveLength(0)
        expect(entries).toHaveLength(3)
        expect('/' in router).toBe(true)
        expect('/home' in router).toBe(true)
        expect('/settings' in router).toBe(true)
        expect(typeof router['/']).toBe('function')
        expect(typeof router['/home']).toBe('function')
        expect(typeof router['/settings']).toBe('function')
    })

    it('RadixTree.findByIndex', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        expect(tree.findByIndex('')).toBe(null)
        expect(tree.findByIndex('/foo')).toBe(null)
        expect(tree.findByIndex('/bar')).toBe(null)

        expect(tree.findByIndex('/')).not.toBe(null)
        expect(tree.findByIndex('/hom')).toBe(null)
        expect(tree.findByIndex('/home')).not.toBe(null)
        expect(tree.findByIndex('/setings')).toBe(null)
        expect(tree.findByIndex('/settings')).not.toBe(null)
    })

    it('RadixTree.addNode', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        expect(tree.hasIndex('/')).toBe(false)
        expect(tree.hasIndex('/home')).toBe(false)
        expect(tree.hasIndex('/settings')).toBe(false)

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/home')).toBe(true)
        expect(tree.hasIndex('/settings')).toBe(true)
    })

    it('RadixTree.merge', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        expect(tree.hasIndex('/')).toBe(false)
        expect(tree.hasIndex('/home')).toBe(false)
        expect(tree.hasIndex('/settings')).toBe(false)

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/home')).toBe(true)
        expect(tree.hasIndex('/settings')).toBe(true)

        const tree2 = new RadixTree<(req: any, res: any) => any>()

        expect(tree2.hasIndex('/contact')).toBe(false)
        expect(tree2.hasIndex('/about')).toBe(false)
        expect(tree2.hasIndex('/links')).toBe(false)

        tree2.addNode('/contact', () => {})
        tree2.addNode('/about', () => {})
        tree2.addNode('/links', () => {})

        expect(tree2.hasIndex('/contact')).toBe(true)
        expect(tree2.hasIndex('/about')).toBe(true)
        expect(tree2.hasIndex('/links')).toBe(true)

        tree.merge(tree2)

        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/home')).toBe(true)
        expect(tree.hasIndex('/settings')).toBe(true)
        expect(tree.hasIndex('/contact')).toBe(true)
        expect(tree.hasIndex('/about')).toBe(true)
        expect(tree.hasIndex('/links')).toBe(true)
    })

    it('RadixTree.removeNode', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        expect(tree.hasIndex('/')).toBe(false)
        expect(tree.hasIndex('/home')).toBe(false)
        expect(tree.hasIndex('/settings')).toBe(false)

        tree.addNode('/', () => {})
        tree.addNode('/home', () => {})
        tree.addNode('/settings', () => {})

        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/home')).toBe(true)
        expect(tree.hasIndex('/settings')).toBe(true)

        expect(tree.removeNode('/home')).toBe(true)

        expect(tree.hasIndex('/home')).toBe(false)
        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/settings')).toBe(true)
    })

    it('RadixTree.setNodeValue', () => {
        const tree = new RadixTree<(req: any, res: any) => any>()

        expect(tree.hasIndex('/')).toBe(false)
        expect(tree.hasIndex('/home')).toBe(false)
        expect(tree.hasIndex('/settings')).toBe(false)

        const handlerA = (_: any, res: any) => {
            res.send('A')
        }
        const handlerB = (_: any, res: any) => {
            res.send('B')
        }

        tree.addNode('/', handlerA)
        tree.addNode('/home', handlerA)
        tree.addNode('/settings', handlerA)

        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/home')).toBe(true)
        expect(tree.hasIndex('/settings')).toBe(true)

        expect(tree.findByIndex('/')).toBe(handlerA)
        expect(tree.findByIndex('/home')).toBe(handlerA)
        expect(tree.findByIndex('/settings')).toBe(handlerA)

        tree.setNodeValue('/settings', handlerB)

        expect(tree.hasIndex('/')).toBe(true)
        expect(tree.hasIndex('/home')).toBe(true)
        expect(tree.hasIndex('/settings')).toBe(true)

        expect(tree.findByIndex('/')).toBe(handlerA)
        expect(tree.findByIndex('/home')).toBe(handlerA)
        expect(tree.findByIndex('/settings')).toBe(handlerB)
    })
})

describe('RadixTree use cases:', () => {
    const teste = {
        cor: 1,
        correto: 2,
        corretíssimo: 3,
    }

    it('should create a RadixTree', () => {
        const tree = new RadixTree(teste)

        expect(tree.root.children.length).toBe(1)
        expect(tree.root.children[0]!.prefix).toBe('cor')
        expect(tree.root.children[0]!.value).toBe(1)
        expect(tree.root.children[0]!.children.length).toBe(1)
        expect(tree.root.children[0]!.children[0]!.prefix).toBe('ret')
        expect(tree.root.children[0]!.children[0]!.value).toBe(null)
        expect(tree.root.children[0]!.children[0]!.children.length).toBe(2)
        expect(tree.root.children[0]!.children[0]!.children[0]!.prefix).toBe('íssimo')
        expect(tree.root.children[0]!.children[0]!.children[0]!.value).toBe(3)
        expect(tree.root.children[0]!.children[0]!.children[0]!.children.length).toBe(0)
        expect(tree.root.children[0]!.children[0]!.children[1]!.prefix).toBe('o')
        expect(tree.root.children[0]!.children[0]!.children[1]!.value).toBe(2)
        expect(tree.root.children[0]!.children[0]!.children[1]!.children.length).toBe(0)
    })

    it('should retrieve all values stored in the tree', () => {
        const tree_1 = new RadixTree<number>()

        tree_1.addNode('cor', 1)
        tree_1.addNode('correto', 2)
        tree_1.addNode('corretíssimo', 3)

        expect(tree_1.findByIndex('c')).toBe(null)
        expect(tree_1.findByIndex('cor')).toBe(1)
        expect(tree_1.findByIndex('coreto')).toBe(null)
        expect(tree_1.findByIndex('correto')).toBe(2)
        expect(tree_1.findByIndex('corretos')).toBe(null)
        expect(tree_1.findByIndex('corretíssimo')).toBe(3)

        //-------------------------------------------------------------------------------------------------------------

        const tree_2 = new RadixTree<number>()

        tree_2.addNode('/vasily/:lebov', 0)
        tree_2.addNode('/vasilev/:anton/vasily/:belov', 1)
        tree_2.addNode('/vasilev/:anton/anton/:petrovich/anton/:vasilyev', 2)
        tree_2.addNode('/vasilev/baton/:vakhlakov/vakhlakov', 3)
        tree_2.addNode('/vasilevs/:antons/tabakovs/:matskyavichus', 4)
        tree_2.addNode('/vasile/:anton', 5)
        tree_2.addNode('/vasily/belov', 6)
        tree_2.addNode('/vasilev/baton/vakhlakov/:vakhlakov', 7)

        expect(tree_2.findByIndex('foo')).toBe(null)
        expect(tree_2.findByIndex('bar')).toBe(null)
        expect(tree_2.findByIndex('/vasily')).toBe(null)
        expect(tree_2.findByIndex('/vasilev/:anton/anton/:petrovich/nton/:vasilyev')).toBe(null)
        expect(tree_2.findByIndex('/vasie/:anton')).toBe(null)

        expect(tree_2.findByIndex('/vasily/:lebov')).toBe(0)
        expect(tree_2.findByIndex('/vasilev/:anton/anton/:petrovich/anton/:vasilyev')).toBe(2)
        expect(tree_2.findByIndex('/vasilev/baton/:vakhlakov/vakhlakov')).toBe(3)
        expect(tree_2.findByIndex('/vasilevs/:antons/tabakovs/:matskyavichus')).toBe(4)
        expect(tree_2.findByIndex('/vasile/:anton')).toBe(5)
        expect(tree_2.findByIndex('/vasily/belov')).toBe(6)
        expect(tree_2.findByIndex('/vasilev/baton/vakhlakov/:vakhlakov')).toBe(7)
    })

    //TODO: write more useCases
})
