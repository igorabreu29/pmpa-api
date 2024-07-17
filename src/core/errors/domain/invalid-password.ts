import { DomainError } from "../domain.ts";

export class InvalidPasswordError extends Error implements DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid password.')
  }
}