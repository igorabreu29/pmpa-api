import { DomainError } from "../domain.ts";

export class InvalidBirthdayError extends Error implements DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid birthday.')
  }
}