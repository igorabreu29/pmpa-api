import type { GenerateClassification, GenerateClassificationProps } from "@/domain/boletim/app/classification/generate-classification.ts"
import queue from "../queue/queue.ts"

export class GenerateClassificationJob implements GenerateClassification {
  async run({ courseId }: GenerateClassificationProps) {
    await queue.add('generate-classification-job', { data: { courseId } })
 
    return {
      message: 'Gerando classificação...'
    }
  }
}