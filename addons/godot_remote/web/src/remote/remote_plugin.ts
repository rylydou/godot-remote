import { Remote } from '.'
import type { EnginePlugin } from '../core'


export interface RemotePlugin extends EnginePlugin {
	remote: Remote


	tick?: () => void


	connected?: () => void
	disconnected?: () => void


	connection_dropped?: () => void
	connection_regained?: () => void
}
