import { UseCaseError } from "../use-case.ts";

export class ResourceAlreadyExistError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Resource already exist.')
  }
}