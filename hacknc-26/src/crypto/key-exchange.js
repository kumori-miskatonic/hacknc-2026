import { getPrivateKey } from './device-keys'

export async function deriveConversationKey(
  myUid,
  otherPublicJwk,
  roomId,
) {
  const privateKey = await getPrivateKey(myUid)

  if (!privateKey) {
    throw new Error('This device has no private key.')
  }

  const otherPublicKey = await crypto.subtle.importKey(
    'jwk',
    otherPublicJwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )

  // ECDH creates shared secret material without transmitting it.
  const secretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: otherPublicKey },
    privateKey,
    256,
  )

  // Use HKDF to derive a separate AES-GCM key.
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    secretBits,
    'HKDF',
    false,
    ['deriveKey'],
  )

  // Both users must use exactly the same room ID and protocol label.
  const salt = new TextEncoder().encode('chat-prototype-v1')
  const info = new TextEncoder().encode(`room-key:${roomId}`)

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info,
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}