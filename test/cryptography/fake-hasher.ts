import { Hasher } from "@/domain/boletim/app/cryptography/hasher.ts";

export class FakeHasher implements Hasher {
  hash = async (plainText: string): Promise<string> => {
    return plainText.concat('-hasher')
  }
  
  compare = async (plainText: string, hash: string): Promise<boolean> => {
    return plainText.concat('-hasher') === hash
  }
}