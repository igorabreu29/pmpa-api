import { UseCaseError } from "@/core/errors/use-case.ts";

export class ConflictError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Conflict!')
  }
}