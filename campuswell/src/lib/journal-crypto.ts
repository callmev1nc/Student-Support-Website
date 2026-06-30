import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'node:crypto'

// AES-256-GCM encryption for private journal entries. Supabase is DB-only with
// NO row-level security, so the application layer is the only access gate and
// journal content must be encrypted at rest.
//
// The key is resolved LAZILY so a missing/invalid JOURNAL_ENCRYPTION_KEY only
// fails when the journal is actually read/written - the rest of the app stays
// up. Dev gets a deterministic derived key; production requires a real
// 32-byte base64 key (generate with `openssl rand -base64 32`).
const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const env = process.env.JOURNAL_ENCRYPTION_KEY
  if (env) {
    const buf = Buffer.from(env, 'base64')
    if (buf.length === 32) return buf
    throw new Error('JOURNAL_ENCRYPTION_KEY must decode to 32 bytes (base64).')
  }
  if (process.env.NODE_ENV !== 'production') {
    return createHash('sha256').update('campuswell-dev-journal-key').digest()
  }
  throw new Error('JOURNAL_ENCRYPTION_KEY is required in production.')
}

export type EncryptedBlob = { payload: string; iv: string; authTag: string }

export function encryptJournal(title: string, content: string): EncryptedBlob {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify({ title, content }), 'utf8'),
    cipher.final(),
  ])
  return {
    payload: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  }
}

export function decryptJournal(blob: EncryptedBlob): {
  title: string
  content: string
} {
  const key = getKey()
  const decipher = createDecipheriv(ALGO, key, Buffer.from(blob.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(blob.authTag, 'base64'))
  const plain = Buffer.concat([
    decipher.update(Buffer.from(blob.payload, 'base64')),
    decipher.final(),
  ])
  return JSON.parse(plain.toString('utf8'))
}
