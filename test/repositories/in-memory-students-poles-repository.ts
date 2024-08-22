import { SearchManyDetailsByPole, StudentsPolesRepository } from "@/domain/boletim/app/repositories/students-poles-repository.ts";
import { StudentPole } from "@/domain/boletim/enterprise/entities/student-pole.ts";
import { StudentWithPole } from "@/domain/boletim/enterprise/entities/value-objects/student-with-pole.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { InMemoryStudentsRepository } from "./in-memory-students-repository.ts";
import { InMemoryStudentsCoursesRepository } from "./in-memory-students-courses-repository.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";
import { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts";

export class InMemoryStudentsPolesRepository implements StudentsPolesRepository {
  public items: StudentPole[] = []

  constructor (
    private studentsRepository: InMemoryStudentsRepository,
    private studentsCoursesRepository: InMemoryStudentsCoursesRepository,
    private coursesRepository: InMemoryCoursesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findByStudentId({ studentId }: { studentId: string; }): Promise<StudentPole | null> {
    const studentPole = this.items.find(item => item.studentId.toValue() === studentId)
    return studentPole ?? null
  }

  async findByStudentIdAndPoleId({ studentId, poleId }: { studentId: string; poleId: string; }): Promise<StudentPole | null> {
    const studentPole = this.items.find(item => item.studentId.toValue() === studentId && item.poleId.toValue() === poleId)
    return studentPole ?? null
  }

  async findLoginConfirmationMetricsByPoleId({ poleId }: { poleId: string; }): Promise<{ totalConfirmedSize: number; totalNotConfirmedSize: number; }> {
    const studentPoles = this.items
      .filter(item => item.poleId.toValue() === poleId)
      .map(studentPole => {
        const pole = this.polesRepository.items.find(pole => pole.id.equals(studentPole.poleId))
        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist`)

        const studentCourse = this.studentsCoursesRepository.items.find(studentCourse => studentCourse.id.equals(studentPole.studentId))
        if (!studentCourse) throw new Error(`Student with ID ${studentPole.studentId.toValue()} does not exist.`)
        
        const student = this.studentsRepository.items.find(student => student.id.equals(studentCourse.studentId))
        if (!student) throw new Error(`Student with ID ${studentPole.studentId.toValue()} does not exist.`)

        return StudentWithPole.create({
          studentId: student.id,
          username: student.username.value,
          email: student.email.value,
          civilId: student.civilId,
          cpf: student.cpf.value,
          birthday: student.birthday.value,
          assignedAt: student.createdAt,
          isLoginConfirmed: student.isLoginConfirmed,
          poleId: pole.id,
          pole: pole.name.value
        })
      })

      const totalConfirmedSize = studentPoles.filter(item => item.isLoginConfirmed).length
      const totalNotConfirmedSize = studentPoles.filter(item => !item.isLoginConfirmed).length

      return {
        totalConfirmedSize,
        totalNotConfirmedSize
      }
  }

  async findManyByPoleId({
    poleId, 
    page, 
    cpf,
    username,
    isEnabled,
    perPage 
  }: { 
    poleId: string; 
    page?: number; 
    cpf?: string
    username?: string
    isEnabled?: boolean
    perPage?: number; 
  }): Promise<{
    studentsPole: StudentWithPole[],
    pages: number
    totalItems: number
  }> {
    const allStudentsPole = this.items
      .filter(item => item.poleId.toValue() === poleId)
      .map(studentPole => {
        const pole = this.polesRepository.items.find(pole => pole.id.equals(studentPole.poleId))
        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist`)

        const studentCourse = this.studentsCoursesRepository.items.find(studentCourse => studentCourse.id.equals(studentPole.studentId))
        if (!studentCourse) throw new Error(`Student with ID ${studentPole.studentId.toValue()} does not exist.`)
        
        const student = this.studentsRepository.items.find(student => student.id.equals(studentCourse.studentId))
        if (!student) throw new Error(`Student with ID ${studentPole.studentId.toValue()} does not exist.`)

        return StudentWithPole.create({
          studentId: student.id,
          username: student.username.value,
          email: student.email.value,
          civilId: student.civilId,
          cpf: student.cpf.value,
          birthday: student.birthday.value,
          assignedAt: student.createdAt,
          isLoginConfirmed: student.isLoginConfirmed,
          poleId: pole.id,
          pole: pole.name.value
        })
      })
      .filter(item => {
        return item.username.toLowerCase().includes(username ? username.toLowerCase() : '') &&
          item.cpf.includes(cpf ?? '')
      })

      const studentsPole = page && perPage ? allStudentsPole.slice((page - 1) * perPage, page * perPage) : allStudentsPole
      const pages = perPage ? Math.ceil(allStudentsPole.length / perPage) : 0

      return {
        studentsPole, 
        pages,
        totalItems: allStudentsPole.length
      }
    }

  async searchManyDetailsByPoleId({ poleId, query, page }: SearchManyDetailsByPole): Promise<{
    studentCoursesDetails: StudentCourseDetails[]
    pages: number
    totalItems: number
  }> {
    const PER_PAGE = 10

    const allStudentCoursesDetails = this.items
      .filter(item => {
        return item.poleId.toValue() === poleId
      })
      .map(studentPole => {
        const studentCourse = this.studentsCoursesRepository.items.find(item => {
          return item.id.equals(studentPole.studentId)
        })
        if (!studentCourse) throw new Error(`Student with ID ${studentPole.id.toValue()} does not exist`)

        const student = this.studentsRepository.items.find(item => item.id.equals(studentCourse.studentId))
        if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist`)

        const course = this.coursesRepository.items.find(item => item.id.equals(studentCourse.courseId))
        if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist`)

        const pole = this.polesRepository.items.find(item => item.id.equals(studentPole.poleId))
        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist`)

        return StudentCourseDetails.create({
          studentId: student.id,
          username: student.username.value,
          cpf: student.cpf.value,
          email: student.email.value,
          birthday: student.birthday.value,
          civilId: student.civilId ? student.civilId : 0,
          assignedAt: student.createdAt,
          courseId: course.id,
          course: course.name.value,
          poleId: pole.id,
          pole: pole.name.value
        })
      })
      .filter(studentDetails => {
        return studentDetails.username.toLowerCase().includes(query.toLowerCase())
      })
      .sort((studentA, studentB) => {
        return studentA.username.localeCompare(studentB.username)
      })

    const studentCoursesDetails = allStudentCoursesDetails.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const totalItems = allStudentCoursesDetails.length
    const pages = Math.ceil(totalItems / PER_PAGE)

    return {
      studentCoursesDetails,
      pages,
      totalItems
    }
  }

  async create(studentPole: StudentPole): Promise<void> {
    this.items.push(studentPole)
  }

  async createMany(studentsPoles: StudentPole[]): Promise<void> {
    studentsPoles.forEach(studentPole => {
      this.items.push(studentPole)
    })
  }

  async delete(studentPole: StudentPole): Promise<void> {
    const studentPoleIndex = this.items.findIndex(item => item.equals(studentPole))
    this.items.splice(studentPoleIndex, 1)
  }
}