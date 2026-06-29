import type { SessionUser } from './index'

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }
}
