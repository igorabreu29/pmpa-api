import { Encrypter } from "@/domain/boletim/app/cryptography/encrypter.ts";
import { app } from "../app.ts";

export class JWTEncrypter implements Encrypter {
  encrypt(payload: Record<string, unknown>) {
    const token = app.jwt.sign({ payload }, { expiresIn: '1h' })
    return token
  }
}