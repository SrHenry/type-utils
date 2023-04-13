import type { Func } from './Func'

export type Action<Params extends any[] = []> = Func<Params, void>
