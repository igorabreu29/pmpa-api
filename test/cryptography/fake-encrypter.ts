import { Encrypter } from "@/domain/boletim/app/cryptography/encrypter.ts";

export class FakeEncrypter implements Encrypter {
  encrypt = (payload: Record<string, unknown>): string => {
    return JSON.stringify(payload)
  }
}