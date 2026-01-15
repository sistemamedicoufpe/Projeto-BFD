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
import type { Report } from '@/types'
import type { IReportsProvider } from '../types'
import { getFirebaseDb } from './config'
import { encryptObject, decryptObject } from '../../encryption/encryption.service'

const COLLECTION_NAME = 'reports'
const ENCRYPTED_FIELDS = ['conteudo']

export class FirebaseReportsProvider implements IReportsProvider {
  private get db() {
    return getFirebaseDb()
  }

  private get collectionRef() {
    return collection(this.db, COLLECTION_NAME)
  }

  private toFirestoreData(report: Partial<Report>): Record<string, unknown> {
    const data = { ...report }
    const encrypted = encryptObject(data, ENCRYPTED_FIELDS) as Record<string, unknown>

    if (data.createdAt instanceof Date) {
      encrypted.createdAt = Timestamp.fromDate(data.createdAt)
    }
    if (data.updatedAt instanceof Date) {
      encrypted.updatedAt = Timestamp.fromDate(data.updatedAt)
    }

    delete encrypted.id
    return encrypted
  }

  private fromFirestoreDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Report {
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
    } as Report
  }

  async getAll(): Promise<Report[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }

  async getById(id: string): Promise<Report | undefined> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return undefined
    return this.fromFirestoreDoc(snapshot)
  }

  async create(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Report> {
    const now = new Date()
    const reportData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      _synced: true,
    }

    const docRef = await addDoc(this.collectionRef, this.toFirestoreData(reportData))

    return {
      ...reportData,
      id: docRef.id,
    } as Report
  }

  async update(id: string, updates: Partial<Report>): Promise<Report> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Relatório não encontrado')
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

  async getByPatientId(patientId: string): Promise<Report[]> {
    const q = query(
      this.collectionRef,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }
}
