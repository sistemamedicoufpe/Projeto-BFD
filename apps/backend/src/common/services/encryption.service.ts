import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly encryptionKey: string;

  constructor(private configService: ConfigService) {
    this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY must be defined in environment variables');
    }
  }

  /**
   * Encrypts a string using AES-256
   * @param data - Plain text to encrypt
   * @returns Encrypted string
   */
  encrypt(data: string): string {
    if (!data) return '';

    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts an encrypted string
   * @param encryptedData - Encrypted string
   * @returns Decrypted plain text
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) return '';

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypts an object by converting it to JSON first
   * @param obj - Object to encrypt
   * @returns Encrypted string
   */
  encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypts a string and parses it as JSON
   * @param encryptedData - Encrypted string
   * @returns Decrypted object
   */
  decryptObject<T>(encryptedData: string): T {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
  }

  /**
   * Hashes a string using SHA256 (one-way)
   * @param data - String to hash
   * @returns Hashed string
   */
  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Verifies if a string matches a hash
   * @param data - Plain text
   * @param hash - Hash to compare
   * @returns true if matches
   */
  verifyHash(data: string, hash: string): boolean {
    return this.hash(data) === hash;
  }
}
