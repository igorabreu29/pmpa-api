import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";
import { InMemoryStudentsCoursesRepository } from "./in-memory-students-courses-repository.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "./in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { StudentDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-details.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class InMemoryStudentsRepository implements StudentsRepository {
  public items: Student[] = []

  constructor (
    private studentsCoursesRepository: InMemoryStudentsCoursesRepository,
    private coursesRepository: InMemoryCoursesRepository,
    private studentsPolesRepository: InMemoryStudentsPolesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findById(id: string): Promise<Student | null> {
    const student = this.items.find(item => item.id.toValue() === id)
    return student ?? null
  }

  async findByCPF(cpf: string): Promise<Student | null> {
    const student = this.items.find(item => item.cpf?.value === cpf)
    return student ?? null
  }

  async findByEmail(email: string): Promise<Student | null> {
    const student = this.items.find(item => item.email?.value === email)
    return student ?? null
  }

  async findDetailsById(id: string): Promise<StudentDetails | null> {
    const student = this.items.find(item => item.id.toValue() === id)
    if (!student) return null    

    const studentCourses = this.studentsCoursesRepository.items.filter(item => {
      return item.studentId.equals(student.id)
    })
    
    const courses = studentCourses.map(studentCourse => {
      const course = this.coursesRepository.items.find(item => item.id.equals(studentCourse.courseId))
      if (!course) throw new Error(`Course with ID ${studentCourse.courseId.toValue()} does not exist.`)

      return course
    })

    const studentPoles = this.studentsPolesRepository.items.filter((item, index) => {
      return item.studentId.equals(studentCourses[index].id)
    })

    const poles = studentPoles.map(studentPole => {
      const pole = this.polesRepository.items.find(item => item.id.equals(studentPole.poleId))
      if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist.`)

      return pole
    })

    return StudentDetails.create({
      studentId: student.id,
      username: student.username.value,
      email: student.email.value,
      cpf: student.cpf.value,
      civilID: student.civilId ?? 0e2,
      birthday: student.birthday.value,
      assignedAt: student.createdAt,
      courses,
      poles
    })
  }
  
  async create(student: Student): Promise<void> {
    this.items.push(student)
  }

  async createMany(students: Student[]): Promise<void> {
    students.forEach(student => {
      this.items.push(student)
    })
  }

  async save(student: Student): Promise<void> {
    const studentIndex = this.items.findIndex(item => item.id.equals(student.id))
    this.items[studentIndex] = student

    DomainEvents.dispatchEventsForAggregate(student.id)
  }

  async delete(student: Student): Promise<void> {
    const studentIndex = this.items.findIndex(item => item.equals(student))
    const studentsCourses = this.studentsCoursesRepository.items.filter(item => item.studentId.equals(student.id))

    for (const studentCourse of studentsCourses) {
      const studentCourseIndex = this.studentsCoursesRepository.items.findIndex(item => item.studentId.equals(studentCourse.studentId))
      const studentPoleIndex = this.studentsPolesRepository.items.findIndex(item => item.studentId.equals(studentCourse.id))

      this.studentsCoursesRepository.items.splice(studentCourseIndex, 1)
      this.studentsPolesRepository.items.splice(studentPoleIndex, 1)
    }

    this.items.splice(studentIndex, 1)
  }
}