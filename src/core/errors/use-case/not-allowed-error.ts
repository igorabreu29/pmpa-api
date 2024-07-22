import { UseCaseError } from "../use-case.ts";

export class NotAllowedError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Not allowed')
  }
}