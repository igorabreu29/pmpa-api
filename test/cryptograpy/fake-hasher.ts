import { Hasher } from "@/domain/boletim/app/cryptography/hasher.ts";

export class FakeHasher implements Hasher {
  hash = async (password: string): Promise<string> => {
    return password.concat('-hasher')
  }
  
  compare = async (password: string, passwordHash: string): Promise<boolean> => {
    return password.concat('-hasher') === passwordHash
  }
}