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
import type { IPatientsProvider, ProviderPatient, CreatePatientData } from '../types'
import { getFirebaseDb } from './config'
import { encryptObject, decryptObject } from '../../encryption/encryption.service'

const COLLECTION_NAME = 'patients'
const ENCRYPTED_FIELDS = ['historicoMedico']

function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export class FirebasePatientsProvider implements IPatientsProvider {
  private get db() {
    return getFirebaseDb()
  }

  private get collectionRef() {
    return collection(this.db, COLLECTION_NAME)
  }

  private toFirestoreData(patient: Partial<ProviderPatient>): Record<string, unknown> {
    const data = { ...patient }

    // Criptografa campos sensíveis
    const encrypted = encryptObject(data, ENCRYPTED_FIELDS) as Record<string, unknown>

    // Converte Date para Timestamp
    if (data.createdAt instanceof Date) {
      encrypted.createdAt = Timestamp.fromDate(data.createdAt) as unknown
    }
    if (data.updatedAt instanceof Date) {
      encrypted.updatedAt = Timestamp.fromDate(data.updatedAt) as unknown
    }

    // Remove id pois é gerenciado pelo Firestore
    delete encrypted.id

    return encrypted
  }

  private fromFirestoreDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): ProviderPatient {
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
    } as ProviderPatient
  }

  async getAll(): Promise<ProviderPatient[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => this.fromFirestoreDoc(d))
  }

  async getById(id: string): Promise<ProviderPatient | undefined> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return undefined
    return this.fromFirestoreDoc(snapshot)
  }

  async create(data: CreatePatientData): Promise<ProviderPatient> {
    const now = new Date()
    const idade = calculateAge(data.dataNascimento)
    const patientData = {
      ...data,
      idade,
      createdAt: now,
      updatedAt: now,
      _synced: true,
    }

    const docRef = await addDoc(this.collectionRef, this.toFirestoreData(patientData))

    return {
      ...patientData,
      id: docRef.id,
    } as ProviderPatient
  }

  async update(id: string, updates: Partial<ProviderPatient>): Promise<ProviderPatient> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Paciente não encontrado')
    }

    const idade = updates.dataNascimento
      ? calculateAge(updates.dataNascimento)
      : existing.idade

    const updatedData = {
      ...updates,
      idade,
      updatedAt: new Date(),
    }

    const docRef = doc(this.db, COLLECTION_NAME, id)
    await updateDoc(docRef, this.toFirestoreData(updatedData))

    return {
      ...existing,
      ...updates,
      id,
      idade,
      updatedAt: new Date(),
      _synced: true,
    }
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  }

  async search(queryStr: string): Promise<ProviderPatient[]> {
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
