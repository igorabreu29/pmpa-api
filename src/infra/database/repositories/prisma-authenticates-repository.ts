import { AuthenticatesRepository } from "@/domain/boletim/app/repositories/authenticates-repository.ts";
import { Authenticate } from "@/domain/boletim/enterprise/entities/authenticate.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaAuthenticatesMapper } from "../mappers/prisma-authenticates-mapper.ts";

export class PrismaAuthenticatesRepository implements AuthenticatesRepository {
  async findById({ id }: { id: string; }): Promise<Authenticate | null> {
    const authenticate = await prisma.user.findUnique({
      where: {
        id
      }
    })
    if (!authenticate) return null

    return PrismaAuthenticatesMapper.toDomain(authenticate)
  }

  async findByCPF({ cpf }: { cpf: string; }): Promise<Authenticate | null> {
    const authenticate = await prisma.user.findUnique({
      where: {
        cpf
      }
    })
    if (!authenticate) return null

    return PrismaAuthenticatesMapper.toDomain(authenticate)
  }

  async findByEmail({ email }: { email: string; }): Promise<Authenticate | null> {
    const authenticate = await prisma.user.findUnique({
      where: {
        email
      }
    })
    if (!authenticate) return null

    return PrismaAuthenticatesMapper.toDomain(authenticate)
  }

  async save(authenticate: Authenticate): Promise<void> {
    await prisma.user.update({
      where: {
        id: authenticate.id.toValue()
      },

      data: {
        password: authenticate.passwordHash.value
      }
    })
  }
}