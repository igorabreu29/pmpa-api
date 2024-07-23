import { AuthenticateUseCase } from "@/domain/boletim/app/use-cases/authenticate.ts";
import { JWTEncrypter } from "../cryptography/jwt-encrypter.ts";
import { PrismaAuthenticatesRepository } from "../database/repositories/prisma-authenticates-repository.ts";

export function makeAuthenticateUseCase() {
  const authenticatesRepository = new PrismaAuthenticatesRepository()
  const encryper = new JWTEncrypter()
  return new AuthenticateUseCase(
    authenticatesRepository,
    encryper
  )
}