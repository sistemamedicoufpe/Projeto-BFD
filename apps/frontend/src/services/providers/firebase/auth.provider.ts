import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types'
import type { IAuthProvider } from '../types'
import { getFirebaseAuth, getFirebaseDb } from './config'

export class FirebaseAuthProvider implements IAuthProvider {
  private currentUser: User | null = null

  private get auth() {
    return getFirebaseAuth()
  }

  private get db() {
    return getFirebaseDb()
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens?: AuthTokens }> {
    const { user: firebaseUser } = await signInWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    )

    const user = await this.getUserData(firebaseUser.uid)
    this.currentUser = user

    return { user }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens?: AuthTokens }> {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      this.auth,
      data.email,
      data.password
    )

    const now = new Date()
    const user: User = {
      id: firebaseUser.uid,
      nome: data.nome,
      email: data.email,
      crm: data.crm,
      especialidade: data.especialidade,
      createdAt: now,
      updatedAt: now,
    }

    // Salva dados do usuário no Firestore
    await setDoc(doc(this.db, 'users', firebaseUser.uid), {
      ...user,
      createdAt: now,
      updatedAt: now,
    })

    this.currentUser = user

    return { user }
  }

  async logout(): Promise<void> {
    await signOut(this.auth)
    this.currentUser = null
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user = await this.getUserData(firebaseUser.uid)
        this.currentUser = user
        callback(user)
      } else {
        this.currentUser = null
        callback(null)
      }
    })
  }

  private async getUserData(uid: string): Promise<User> {
    const userDoc = await getDoc(doc(this.db, 'users', uid))

    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado')
    }

    const data = userDoc.data()
    return {
      ...data,
      id: uid,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } as User
  }
}
