import type { Func } from './Func.ts'

export type Action<Params extends any[] = []> = Func<Params, void>
