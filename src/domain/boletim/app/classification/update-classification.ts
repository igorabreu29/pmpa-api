export interface UpdateClassificationProps {
  courseId: string
}

export interface UpdateClassification {
  run: ({ courseId }: UpdateClassificationProps) => Promise<void>
}