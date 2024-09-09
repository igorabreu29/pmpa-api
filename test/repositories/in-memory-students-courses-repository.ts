import { StudentsCoursesRepository, type SearchManyDetails } from "@/domain/boletim/app/repositories/students-courses-repository.ts";
import { StudentCourse } from "@/domain/boletim/enterprise/entities/student-course.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";
import { InMemoryStudentsRepository } from "./in-memory-students-repository.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { InMemoryStudentsPolesRepository } from "./in-memory-students-poles-repository.ts";
import { StudentWithPole } from "@/domain/boletim/enterprise/entities/value-objects/student-with-pole.ts";
import { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts";
import { StudentWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/student-with-course.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class InMemoryStudentsCoursesRepository implements StudentsCoursesRepository {
  public items: StudentCourse[] = []

  constructor (
    private studentsRepository: InMemoryStudentsRepository, 
    private coursesRepository: InMemoryCoursesRepository,
    private studentsPolesRepository: InMemoryStudentsPolesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string; courseId: string; }): Promise<StudentCourse | null> {
    const studentCourse = this.items.find(item => item.studentId.toValue() === studentId && item.courseId.toValue() === courseId)
    return studentCourse ?? null
  }

  async findDetailsByCourseAndStudentId({ courseId, studentId }: { courseId: string; studentId: string; }): Promise<StudentCourseDetails | null> {
    const studentCourse = this.items.find(item => {
      return item.courseId.toValue() === courseId &&
        item.studentId.toValue() === studentId
    })
    if (!studentCourse) return null

    const student = this.studentsRepository.items.find(item => item.id.equals(studentCourse.studentId))
    if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist`)

    const course = this.coursesRepository.items.find(item => item.id.equals(studentCourse.courseId))
    if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist`)

    const studentPole = this.studentsPolesRepository.items.find(item => item.studentId.equals(studentCourse.id))
    if (!studentPole) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist`)

    const pole = this.polesRepository.items.find(item => item.id.equals(studentPole.poleId))
    if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist`) 

    return StudentCourseDetails.create({
      studentId: student.id,
      username: student.username.value,
      civilId: student.civilId,
      birthday: student.birthday.value,
      assignedAt: student.createdAt,
      email: student.email.value,
      cpf: student.cpf.value,
      course: course.name.value,
      courseId: course.id,
      formula: course.formula,
      pole: pole.name.value,
      poleId: pole.id 
    })
  }

  async findManyByCourseIdWithPole({ courseId }: { courseId: string; }): Promise<StudentWithPole[]> {
    const studentsCourses = this.items
      .filter(item => item.courseId.toValue() === courseId && item.isActive)
      .map(studentCourse =>{ 
        const student = this.studentsRepository.items.find(item => {
          return item.id.equals(studentCourse.studentId)
        })
        if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist`)
        
        const studentPole = this.studentsPolesRepository.items.find(item => {
          return item.studentId.equals(studentCourse.id)
        })
        if (!studentPole) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist`)

        const pole = this.polesRepository.items.find(item => {
          return item.id.equals(studentPole.poleId)
        })

        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist`)

        return StudentWithPole.create({
          username: student.username.value,
          assignedAt: student.createdAt,
          birthday: student.birthday.value,
          civilId: student.civilId,
          cpf: student.cpf.value,
          email: student.email.value,
          pole: pole.name.value,
          poleId: pole.id,
          studentId: student.id,
          isLoginConfirmed: student.isLoginConfirmed
        })
      })

      return studentsCourses
  }

  async findManyByStudentIdWithCourse({ 
    studentId, 
    page, 
    perPage 
  }: {  
    studentId: string
    page: number
    perPage: number
  }): Promise<{ 
    studentCourses: StudentWithCourse[]
    pages: number
    totalItems: number
  }> {
    const allStudentCourses = this.items
      .filter(item => {
        return item.studentId.toValue() === studentId
      })
      .map(studentCourse => {
        const course = this.coursesRepository.items.find(item => item.id.equals(studentCourse.courseId))
        if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist.`) 

        const student = this.studentsRepository.items.find(item => item.id.equals(studentCourse.studentId))
        if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist.`) 

        return StudentWithCourse.create({
          studentId: studentCourse.studentId,
          courseId: studentCourse.courseId,
          course: course.name.value,
          assignedAt: studentCourse.createdAt,
          cpf: student.cpf.value,
          email: student.email.value,
          imageUrl: course.imageUrl,
          username: student.username.value
        })
      })

    const studentCourses = allStudentCourses.slice((page - 1) * perPage, page * perPage)
    const pages = Math.ceil(allStudentCourses.length / perPage)

    return {
      studentCourses,
      pages,
      totalItems: allStudentCourses.length
    }
  }

  async findManyDetailsByCourseId({ 
    courseId, 
    page, 
    cpf,
    isEnabled = true,
    username,
    perPage 
  }: { 
    courseId: string; 
    page?: number; 
    cpf?: string
    username?: string
    isEnabled?: boolean
    perPage?: number; 
  }): Promise<{ 
    studentsCourse: StudentCourseDetails[]; 
    pages?: number; 
    totalItems?: number; 
  }> {
    if (page && perPage) {
      const allStudentsCourses = this.items
        .filter(item => {
          return item.courseId.toValue() === courseId 
            && isEnabled ? item.isActive : !item.isActive
        })
        .map(studentCourse => {
          const student = this.studentsRepository.items.find(item => {
            return item.id.equals(studentCourse.studentId)
          })
          if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist.`)
  
          const course = this.coursesRepository.items.find(item => {
            return item.id.equals(studentCourse.courseId)
          })
          if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist.`)
  
          const studentPole = this.studentsPolesRepository.items.find(item => { 
            return item.studentId.equals(studentCourse.id)
          })
          if (!studentPole) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist.`)
  
          const pole = this.polesRepository.items.find(item => {
            return item.id.equals(studentPole.poleId)
          })
          if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist.`)
  
          return StudentCourseDetails.create({
            studentId: student.id,
            username: student.username.value,
            cpf: student.cpf.value,
            email: student.email.value,
            birthday: student.birthday.value,
            civilId: student.civilId,
            assignedAt: student.createdAt,
            courseId: course.id,
            course: course.name.value,
            formula: course.formula,
            poleId: pole.id,
            pole: pole.name.value,
          })
        })
        .filter(item => {
          return item.username.toLowerCase().includes(username ? username.toLowerCase() : '') && 
            item.cpf.toLowerCase().includes(cpf || '')
        })

      const studentsCourse = allStudentsCourses.slice((page - 1) * perPage, page * perPage)
      const pages = Math.ceil(allStudentsCourses.length / perPage)
        
      return {
        studentsCourse,
        pages,
        totalItems: allStudentsCourses.length
      }
    }

    const studentsCourse = this.items
      .filter(item => {
        return item.courseId.toValue() === courseId 
          && isEnabled ? item.isActive : !item.isActive
      })
      .map(studentCourse => {
        const student = this.studentsRepository.items.find(item => {
          return item.id.equals(studentCourse.studentId)
        })
        if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist.`)

        const course = this.coursesRepository.items.find(item => {
          return item.id.equals(studentCourse.courseId)
        })
        if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist.`)

        const studentPole = this.studentsPolesRepository.items.find(item => { 
          return item.studentId.equals(studentCourse.id)
        })
        if (!studentPole) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist.`)

        const pole = this.polesRepository.items.find(item => {
          return item.id.equals(studentPole.poleId)
        })
        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist.`)

        return StudentCourseDetails.create({
          studentId: student.id,
          username: student.username.value,
          cpf: student.cpf.value,
          email: student.email.value,
          birthday: student.birthday.value,
          civilId: student.civilId,
          assignedAt: student.createdAt,
          courseId: course.id,
          course: course.name.value,
          formula: course.formula,
          poleId: pole.id,
          pole: pole.name.value,
        })
      })
      .filter(item => {
        return item.username.toLowerCase().includes(username ? username.toLowerCase() : '') && 
          item.cpf.toLowerCase().includes(cpf || '')
      })

      return {
        studentsCourse,
      }
  }

  async findManyByCourseIdAndPoleIdWithCourseAndPole({ 
    courseId, 
    poleId,
    page, 
    perPage 
  }: { 
    courseId: string; 
    poleId: string
    page: number; 
    perPage: number; 
  }): Promise<{ 
    studentsCourse: StudentCourseDetails[]; 
    pages: number; 
    totalItems: number; 
  }> {
    const allStudentsCourses = this.items
      .filter(item => {
        const pole = this.polesRepository.items.find(pole => pole.id.toValue() === poleId)
        if (!pole) throw new Error(`Pole with ID ${poleId} does not exist`)

        return item.courseId.toValue() === courseId
      })
      .map(studentCourse => {
        const student = this.studentsRepository.items.find(item => {
          return item.id.equals(studentCourse.studentId)
        })
        if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist.`)

        const course = this.coursesRepository.items.find(item => {
          return item.id.equals(studentCourse.courseId)
        })
        if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist.`)

        const studentPole = this.studentsPolesRepository.items.find(item => { 
          return item.studentId.equals(studentCourse.id)
        })
        if (!studentPole) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist.`)

        const pole = this.polesRepository.items.find(item => {
          return item.id.equals(studentPole.poleId)
        })
        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist.`)

        return StudentCourseDetails.create({
          studentId: student.id,
          username: student.username.value,
          cpf: student.cpf.value,
          email: student.email.value,
          birthday: student.birthday.value,
          civilId: student.civilId,
          assignedAt: student.createdAt,
          courseId: course.id,
          course: course.name.value,
          formula: course.formula,
          poleId: pole.id,
          pole: pole.name.value
        })
      })

      const studentsCourse = allStudentsCourses.slice((page - 1) * perPage, page * perPage)
      const pages = Math.ceil(allStudentsCourses.length / perPage)
      
      return {
        studentsCourse,
        pages,
        totalItems: allStudentsCourses.length
      }
  }

  async searchManyDetailsByCourseId({ courseId, query, page }: SearchManyDetails): Promise<{
    studentCoursesDetails: StudentCourseDetails[]
    pages: number
    totalItems: number
  }> {
    const PER_PAGE = 10

    const allStudentCoursesDetails = this.items
      .filter(item => {
        return item.courseId.toValue() === courseId
      })
      .map(studentCourse => {
        const student = this.studentsRepository.items.find(item => item.id.equals(studentCourse.studentId))
        if (!student) throw new Error(`Student with ID ${studentCourse.studentId.toValue()} does not exist`)

        const course = this.coursesRepository.items.find(item => item.id.equals(studentCourse.courseId))
        if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist`)

        const studentPole = this.studentsPolesRepository.items.find(item => item.studentId.equals(studentCourse.id))
        if (!studentPole) throw new Error(`Pole with ID ${studentCourse.studentId.toValue()} does not exist`)

        const pole = this.polesRepository.items.find(item => item.id.equals(studentPole.poleId))
        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist`)

        return StudentCourseDetails.create({
          studentId: student.id,
          username: student.username.value,
          cpf: student.cpf.value,
          email: student.email.value,
          birthday: student.birthday.value,
          civilId: student.civilId,
          assignedAt: student.createdAt,
          courseId: course.id,
          course: course.name.value,
          formula: course.formula,
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

  async create(studentCourse: StudentCourse): Promise<void> {
    this.items.push(studentCourse)
  }

  async createMany(studentsCourses: StudentCourse[]): Promise<void> {
    studentsCourses.forEach(studentCourse => {
      this.items.push(studentCourse)
    })
  }

  async save(studentCourse: StudentCourse): Promise<void> {
    const studentCourseIndex = this.items.findIndex(item => item.equals(studentCourse))
    this.items[studentCourseIndex] = studentCourse 
  }

  async updateStatus(studentCourse: StudentCourse): Promise<void> {
    const studentCourseIndex = this.items.findIndex(item => item.id.equals(studentCourse.id))
    this.items[studentCourseIndex] = studentCourse

    DomainEvents.dispatchEventsForAggregate(studentCourse.id)
  }

  async delete(studentCourse: StudentCourse): Promise<void> {
    const studentPoleIndex = this.studentsPolesRepository.items.findIndex(item => item.studentId.equals(studentCourse.id))
    this.studentsPolesRepository.items.splice(studentPoleIndex, 1)

    const studentCourseIndex = this.items.findIndex(item => item.equals(studentCourse))
    this.items.splice(studentCourseIndex, 1)
  }
}