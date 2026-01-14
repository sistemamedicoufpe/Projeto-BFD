import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import type { Patient } from '@/types'
import type { IPatientsProvider } from '../types'
import { getFirebaseDb } from './config'
import { encryptObject, decryptObject } from '../../encryption/encryption.service'

const COLLECTION_NAME = 'patients'
const ENCRYPTED_FIELDS = ['historicoMedico']

export class FirebasePatientsProvider implements IPatientsProvider {
  private get db() {
    return getFirebaseDb()
  }

  private get collectionRef() {
    return collection(this.db, COLLECTION_NAME)
  }

  private toFirestoreData(patient: Partial<Patient>): Record<string, unknown> {
    const data = { ...patient }

    // Criptografa campos sensíveis
    const encrypted = encryptObject(data, ENCRYPTED_FIELDS)

    // Converte Date para Timestamp
    if (data.createdAt instanceof Date) {
      encrypted.createdAt = Timestamp.fromDate(data.createdAt)
    }
    if (data.updatedAt instanceof Date) {
      encrypted.updatedAt = Timestamp.fromDate(data.updatedAt)
    }

    // Remove id pois é gerenciado pelo Firestore
    delete encrypted.id

    return encrypted
  }

  private fromFirestoreDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Patient {
    const data = docSnapshot.data() as Record<string, unknown>

    // Descriptografa campos sensíveis
    const decrypted = decryptObject(data, ENCRYPTED_FIELDS)

    // Converte Timestamp para Date
    const createdAt = data.createdAt as Timestamp
    const updatedAt = data.updatedAt as Timestamp

    return {
      ...decrypted,
      id: docSnapshot.id,
      createdAt: createdAt?.toDate?.() ?? new Date(),
      updatedAt: updatedAt?.toDate?.() ?? new Date(),
      _synced: true,
    } as Patient
  }

  async getAll(): Promise<Patient[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }

  async getById(id: string): Promise<Patient | undefined> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return undefined
    return this.fromFirestoreDoc(snapshot)
  }

  async create(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Patient> {
    const now = new Date()
    const patientData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      _synced: true,
    }

    const docRef = await addDoc(this.collectionRef, this.toFirestoreData(patientData))

    return {
      ...patientData,
      id: docRef.id,
    } as Patient
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Paciente não encontrado')
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

  async search(queryStr: string): Promise<Patient[]> {
    // Firestore não suporta busca de texto nativa
    // Busca todos e filtra no cliente
    const all = await this.getAll()
    const lowerQuery = queryStr.toLowerCase()

    return all.filter(
      (patient) =>
        patient.nome.toLowerCase().includes(lowerQuery) ||
        (patient.cpf?.includes(queryStr) ?? false)
    )
  }

  async count(): Promise<number> {
    const snapshot = await getDocs(this.collectionRef)
    return snapshot.size
  }
}
