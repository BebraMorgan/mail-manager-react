import { getSessionVersion } from '../client/model/authSession'

export const createRequestGuard = () => {
	let revision = 0
	return {
		begin: () => {
			const request = ++revision
			const session = getSessionVersion()
			return () => request === revision && session === getSessionVersion()
		},
		invalidate: () => {
			revision += 1
		},
	}
}
