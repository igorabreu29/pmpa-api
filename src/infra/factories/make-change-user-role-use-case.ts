import { ChangeUserRoleUseCase } from "@/domain/boletim/app/use-cases/change-user-role.ts";
import { PrismaAuthenticatesRepository } from "../database/repositories/prisma-authenticates-repository.ts";

export function makeChangeUserRoleUseCase() {
  const authenticatesRepository = new PrismaAuthenticatesRepository()
  return new ChangeUserRoleUseCase(authenticatesRepository)
}