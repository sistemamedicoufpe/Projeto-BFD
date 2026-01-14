import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  if (app && db && auth) {
    return { app, db, auth }
  }

  // Verifica se as configurações estão presentes
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase configuration missing. Please set VITE_FIREBASE_* environment variables.'
    )
  }

  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)

  // Habilitar persistência offline
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported in this browser')
    } else {
      console.error('Firestore persistence error:', err)
    }
  })

  return { app, db, auth }
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) initializeFirebase()
  return app!
}

export function getFirebaseDb(): Firestore {
  if (!db) initializeFirebase()
  return db!
}

export function getFirebaseAuth(): Auth {
  if (!auth) initializeFirebase()
  return auth!
}
