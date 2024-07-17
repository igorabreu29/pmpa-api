import { DomainError } from "../domain.ts";

export class InvalidCPFError extends Error implements DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid CPF.')
  }
}