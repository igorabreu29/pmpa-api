import { RestorePasswordUseCase } from "@/domain/boletim/app/use-cases/restore-password.ts";
import { PrismaAuthenticatesRepository } from "../database/repositories/prisma-authenticates-repository.ts";

export function makeRestorePasswordUseCase() {
  const authenticatesRepository = new PrismaAuthenticatesRepository()
  return new RestorePasswordUseCase(authenticatesRepository)
}