import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import type { Evaluation } from '@/types'
import type { IEvaluationsProvider } from '../types'
import { getFirebaseDb } from './config'
import { encryptObject, decryptObject } from '../../encryption/encryption.service'

const COLLECTION_NAME = 'evaluations'
const ENCRYPTED_FIELDS = ['exameNeurologico']

export class FirebaseEvaluationsProvider implements IEvaluationsProvider {
  private get db() {
    return getFirebaseDb()
  }

  private get collectionRef() {
    return collection(this.db, COLLECTION_NAME)
  }

  private toFirestoreData(evaluation: Partial<Evaluation>): Record<string, unknown> {
    const data = { ...evaluation }
    const encrypted = encryptObject(data, ENCRYPTED_FIELDS)

    if (data.createdAt instanceof Date) {
      encrypted.createdAt = Timestamp.fromDate(data.createdAt)
    }
    if (data.updatedAt instanceof Date) {
      encrypted.updatedAt = Timestamp.fromDate(data.updatedAt)
    }

    delete encrypted.id
    return encrypted
  }

  private fromFirestoreDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Evaluation {
    const data = docSnapshot.data() as Record<string, unknown>
    const decrypted = decryptObject(data, ENCRYPTED_FIELDS)

    const createdAt = data.createdAt as Timestamp
    const updatedAt = data.updatedAt as Timestamp

    return {
      ...decrypted,
      id: docSnapshot.id,
      createdAt: createdAt?.toDate?.() ?? new Date(),
      updatedAt: updatedAt?.toDate?.() ?? new Date(),
      _synced: true,
    } as Evaluation
  }

  async getAll(): Promise<Evaluation[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }

  async getById(id: string): Promise<Evaluation | undefined> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return undefined
    return this.fromFirestoreDoc(snapshot)
  }

  async create(data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Evaluation> {
    const now = new Date()
    const evaluationData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      _synced: true,
    }

    const docRef = await addDoc(this.collectionRef, this.toFirestoreData(evaluationData))

    return {
      ...evaluationData,
      id: docRef.id,
    } as Evaluation
  }

  async update(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Avaliação não encontrada')
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    }

    const docRef = doc(this.db, COLLECTION_NAME, id)
    await updateDoc(docRef, this.toFirestoreData(updatedData))

    return {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date(),
      _synced: true,
    }
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  }

  async getByPatientId(patientId: string): Promise<Evaluation[]> {
    const q = query(
      this.collectionRef,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }

  async countByPatient(patientId: string): Promise<number> {
    const q = query(this.collectionRef, where('patientId', '==', patientId))
    const snapshot = await getDocs(q)
    return snapshot.size
  }

  async getToday(): Promise<Evaluation[]> {
    const all = await this.getAll()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return all.filter((evaluation) => {
      const evalDate = new Date(evaluation.data)
      return evalDate >= today && evalDate < tomorrow
    })
  }
}
