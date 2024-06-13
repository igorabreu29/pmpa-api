import { UseCaseError } from "@/core/errors/use-case.ts";

export class InvalidCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('Invalid credentials.')
  }
}