import { DomainError } from "../domain.ts";

export class InvalidEmailError extends Error implements DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid email.')
  }
}