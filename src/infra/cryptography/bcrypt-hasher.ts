import type { Hasher } from "@/domain/boletim/app/cryptography/hasher.ts";
import bcrypt from 'bcryptjs'

export class BcryptHasher implements Hasher {
  async hash (plainText: string) {
    const hasher = bcrypt.hash(plainText, 8)
    return hasher
  }

  async compare (plainText: string, hash: string) {
    return bcrypt.compare(plainText, hash)
  }
}