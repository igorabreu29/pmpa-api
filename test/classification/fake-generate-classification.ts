import type { GenerateClassification } from "@/domain/boletim/app/classification/generate-classification.ts";

export class FakeGenerateClassification implements GenerateClassification {
  async run(): Promise<{
    message: string
  }> {
    return {
      message: 'Gerando classificação...'
    }
  }
}