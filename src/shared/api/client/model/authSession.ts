type LogoutHandler = () => void
let handler: LogoutHandler | null = null
let version = 0
const resets = new Set<() => void>()
export const getSessionVersion = () => version
export const startSession = () => {
	version += 1
	resets.forEach((fn) => fn())
}
export const subscribeSessionReset = (fn: () => void) => {
	resets.add(fn)
	return () => {
		resets.delete(fn)
	}
}
export const setLogoutHandler = (fn: LogoutHandler | null) => {
	handler = fn
}
export const logout = () => {
	startSession()
	handler?.()
}
