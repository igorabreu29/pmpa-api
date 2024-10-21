export interface GenerateClassificationProps {
  courseId: string
}

export interface GenerateClassification {
  run: ({ courseId }: GenerateClassificationProps) => Promise<{
    message: string
  }>
}