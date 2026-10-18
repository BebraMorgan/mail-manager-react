import { createContext } from 'react'
import type { AuthContextValue } from '../model/types'
export const AuthContext = createContext<AuthContextValue | null>(null)
