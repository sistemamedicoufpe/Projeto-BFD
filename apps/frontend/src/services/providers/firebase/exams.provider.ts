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
import type { Exam } from '@/types'
import type { IExamsProvider } from '../types'
import { getFirebaseDb } from './config'

const COLLECTION_NAME = 'exams'

export class FirebaseExamsProvider implements IExamsProvider {
  private get db() {
    return getFirebaseDb()
  }

  private get collectionRef() {
    return collection(this.db, COLLECTION_NAME)
  }

  private toFirestoreData(exam: Partial<Exam>): Record<string, unknown> {
    const data = { ...exam } as Record<string, unknown>

    if ((exam as { createdAt?: Date }).createdAt instanceof Date) {
      data.createdAt = Timestamp.fromDate((exam as { createdAt: Date }).createdAt)
    }
    if ((exam as { updatedAt?: Date }).updatedAt instanceof Date) {
      data.updatedAt = Timestamp.fromDate((exam as { updatedAt: Date }).updatedAt)
    }

    delete data.id
    return data
  }

  private fromFirestoreDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Exam {
    const data = docSnapshot.data() as Record<string, unknown>

    const createdAt = data.createdAt as Timestamp
    const updatedAt = data.updatedAt as Timestamp

    return {
      ...data,
      id: docSnapshot.id,
      createdAt: createdAt?.toDate?.() ?? new Date(),
      updatedAt: updatedAt?.toDate?.() ?? new Date(),
      _synced: true,
    } as Exam
  }

  async getAll(): Promise<Exam[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }

  async getById(id: string): Promise<Exam | undefined> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return undefined
    return this.fromFirestoreDoc(snapshot)
  }

  async create(data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Exam> {
    const now = new Date()
    const examData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      _synced: true,
    }

    const docRef = await addDoc(this.collectionRef, this.toFirestoreData(examData))

    return {
      ...examData,
      id: docRef.id,
    } as Exam
  }

  async update(id: string, updates: Partial<Exam>): Promise<Exam> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Exame não encontrado')
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
    } as Exam
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  }

  async getByPatientId(patientId: string): Promise<Exam[]> {
    const q = query(
      this.collectionRef,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }

  async getByType(type: string): Promise<Exam[]> {
    const q = query(this.collectionRef, where('tipo', '==', type))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }
}
