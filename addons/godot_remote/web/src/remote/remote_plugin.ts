import { Remote } from '.'
import type { Plugin } from '../core'


export interface RemotePlugin extends Plugin {
	engine: Remote
}
