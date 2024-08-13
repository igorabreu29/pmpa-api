import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { ChangeManagerAvatarUseCase } from "@/domain/boletim/app/use-cases/change-manager-avatar.ts";

export function makeChangeManagerAvatarUseCase() {
  const managersRepository = new PrismaManagersRepository()
  return new ChangeManagerAvatarUseCase(
    managersRepository,
  )
}