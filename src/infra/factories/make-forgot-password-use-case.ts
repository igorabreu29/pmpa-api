import { ForgotPasswordUseCase } from "@/domain/boletim/app/use-cases/forgot-password.ts";
import { PrismaAuthenticatesRepository } from "../database/repositories/prisma-authenticates-repository.ts";
import { Nodemailer } from "../mail/mailer.ts";

export function makeForgotPasswordUseCase() {
  const authenticatesRepository = new PrismaAuthenticatesRepository()
  const mailer = new Nodemailer()
  
  return new ForgotPasswordUseCase(
    authenticatesRepository,
    mailer
  )
}