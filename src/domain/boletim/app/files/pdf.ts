import { CourseHistoric } from "../../enterprise/entities/course-historic.ts"
import { Course } from "../../enterprise/entities/course.ts"
import { Student } from "../../enterprise/entities/student.ts"
import { CourseWithDiscipline } from "../../enterprise/entities/value-objects/course-with-discipline.ts"
import type { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js"

interface Row {
  course: Course
  student: Student
  studentClassification: number
  grades: StudentClassficationByModule | StudentClassficationByPeriod
  courseWithDisciplines: CourseWithDiscipline[]
  courseHistoric: CourseHistoric
}

export interface PDFCreateProps {
  rows: Row
}

export interface PDF {
  create: ({ rows }: PDFCreateProps) => Promise<{
    filename: string
  }>
}