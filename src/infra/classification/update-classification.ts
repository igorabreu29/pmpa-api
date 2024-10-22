import type { UpdateClassification, UpdateClassificationProps } from "@/domain/boletim/app/classification/update-classification.ts"
import queue from "../queue/queue.ts"

export class UpdateClassificationJob implements UpdateClassification {
  async run({ courseId }: UpdateClassificationProps) {
    await queue.add('update-classification-job', { data: { courseId } })
  }
}