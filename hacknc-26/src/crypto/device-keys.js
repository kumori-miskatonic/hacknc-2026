const DB_NAME = 'chat-crypto'
const STORE_NAME = 'device-keys'

function openKeyDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Save private key to the DB for a given user ID
async function savePrivateKey(uid, privateKey) {
  const database = await openKeyDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      'readwrite'
    )

    transaction.objectStore(STORE_NAME).put(privateKey, uid)
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
  })
}

// Get private key from the DB for a given user ID
export async function getPrivateKey(uid) {
  const database = await openKeyDatabase()

  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .get(uid)

    request.onsuccess = () => {
      database.close()
      resolve(request.result ?? null)
    }
    request.onerror = () => {
      database.close()
      reject(request.error)
    }
  })
}

// Create a new ECDH key pair or retrieve an existing one from the DB
export async function createDeviceKeys(uid) {
  const existing = await getPrivateKey(uid);

  if (existing) {
    throw new Error('A key already exists for this account on this browser.')
  }

  const pair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  )

  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    privateJwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits'],
  )

  await savePrivateKey(uid, privateKey)

  return publicJwk
}