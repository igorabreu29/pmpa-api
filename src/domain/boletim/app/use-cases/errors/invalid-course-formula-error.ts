import { UseCaseError } from "@/core/errors/use-case.ts";

export class InvalidCourseFormulaError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Invalid Formula')
  }
}