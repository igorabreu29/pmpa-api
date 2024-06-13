import { UseCaseError } from "../use-case.ts";

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Resource not found.')
  }
}