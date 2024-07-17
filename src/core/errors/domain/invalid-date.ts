import { DomainError } from "../domain.ts";

export class InvalidDateError extends Error implements DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid date.')
  }
}