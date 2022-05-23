import { keys } from './constants'

export type Optional = [rule: keys['optional'], args: []]
export const Optional = () => [keys['optional'], []] as Optional
