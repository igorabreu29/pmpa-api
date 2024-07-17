import { DomainError } from "../domain.ts";

export class InvalidNameError extends Error implements DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid name.')
  }
}