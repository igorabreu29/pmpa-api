import { beforeEach, describe, expect, it } from "vitest";
import { FakeHasher } from "test/cryptography/fake-hasher.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CreateStudentsBatchUseCase } from "./create-students-batch.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { InMemoryStudentsBatchRepository } from "test/repositories/in-memory-students-batch-repository.ts";

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsBatchRepository: InMemoryStudentsBatchRepository
let hasher: FakeHasher
let sut: CreateStudentsBatchUseCase

describe('Create Students Batch Use Case', () => {
  beforeEach(() => {
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    polesRepository = new InMemoryPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      polesRepository
    )

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    studentsBatchRepository = new InMemoryStudentsBatchRepository()

    hasher = new FakeHasher()
    sut = new CreateStudentsBatchUseCase (
      studentsRepository,
      coursesRepository,
      studentsCoursesRepository,
      polesRepository,
      studentsPolesRepository,
      studentsBatchRepository,
      hasher
    )
  })
  
  describe('Student With CPF', () => {
    it ('should not be able to create students batch in the course if the student(cpf) already present', async () => {
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const student = makeStudent()
      studentsRepository.create(student)
  
      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      studentsCoursesRepository.create(studentCourse)
  
      const data = {
        courseName: course.name.value,
        userId: '',
        userIp: '',
        fileName: '',
        fileLink: '',
        students: [
          {
            username: 'John Doe',
            cpf: '222.000.222-00',
            email: student.email.value,
            civilId: 12345,
            poleName: pole.name.value,
            birthday: new Date(2003)
          },
          {
            username: 'Josh Ned',
            cpf: '111.000.000-00',
            email: 'johned@acne.com',
            civilId: 23456,
            poleName: pole.name.value,
            birthday: new Date(2003)
          }
        ]
      }
  
      const result = await sut.execute(data)
  
      expect(result.isLeft()).toBe(true)
    })

    it ('should be able to add the student with cpf to the course and pole', async () => {
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const student = makeStudent()
      studentsRepository.create(student)
  
      const data = {
        courseName: course.name.value,
        userId: 'user-1',
        userIp: '0.0.0.0',
        fileName: 'add-student-batch.xlsx',
        fileLink: 'http://0.0.0.0/add-students-batch.xlsx',
        students: [
          {
            username: student.username.value,
            cpf: '000.000.000-00',
            email: student.email.value,
            civilId: student.civilId,
            poleName: pole.name.value,
            birthday: student.birthday.value
          }
        ]
      }
  
      const result = await sut.execute(data)
      
      expect(result.isRight()).toBe(true)
      expect(studentsBatchRepository.items[0]).toMatchObject({
        students: [
          {
            student: {
              id: student.id,
              cpf: student.cpf
            },
            studentCourse: {
              courseId: course.id,
              studentId: student.id
            },
            studentPole: {
              poleId: pole.id,
              studentId: studentsBatchRepository.items[0].students[0].studentCourse.id
            }
          }
        ]
      })
    })
  })

  describe ('Student With Email', () => {
    it ('should not be able to create students batch in the course if the student(email) already present', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const pole = makePole()
      polesRepository.create(pole)

      const student = makeStudent()
      studentsRepository.create(student)

      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      studentsCoursesRepository.create(studentCourse)

      const data = {
        courseName: course.name.value,
        userId: '',
        userIp: '',
        fileName: '',
        fileLink: '',
        students: [
          {
            username: 'John Doe',
            cpf: '222.000.222-00',
            email: student.email.value,
            civilId: 12345,
            poleName: pole.name.value,
            birthday: new Date(2003)
          },
          {
            username: 'Josh Ned',
            cpf: '111.000.000-00',
            email: 'johned@acne.com',
            civilId: 23456,
            poleName: pole.name.value,
            birthday: new Date(2003)
          }
        ]
      }

      const result = await sut.execute(data)

      expect(result.isLeft()).toBe(true)
    })

    it ('should be able to add the student with email to the course and pole', async () => {
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const student = makeStudent()
      studentsRepository.create(student)
  
      const data = {
        courseName: course.name.value,
        userId: 'user-1',
        userIp: '0.0.0.0',
        fileName: 'add-student-batch.xlsx',
        fileLink: 'http://0.0.0.0/add-students-batch.xlsx',
        students: [
          {
            username: student.username.value,
            cpf: '111.000.000-00',
            email: student.email.value,
            civilId: student.civilId,
            poleName: pole.name.value,
            birthday: student.birthday.value
          }
        ]
      }

      const result = await sut.execute(data)
      
      expect(result.isRight()).toBe(true)
      expect(studentsBatchRepository.items[0]).toMatchObject({
        students: [
          {
            student: {
              id: student.id,
              email: student.email
            },
            studentCourse: {
              courseId: course.id,
              studentId: student.id
            },
            studentPole: {
              poleId: pole.id,
              studentId: studentsBatchRepository.items[0].students[0].studentCourse.id
            }
          }
        ]
      })
    })
  })

  describe('Student', () => {
    it ('should not be able create students batch if course does not exist', async () => {
      const result = await sut.execute({ 
        courseName: 'invalid', 
        students: [], 
        userId: '', 
        userIp: '',
        fileName: '',
        fileLink: '',
      })
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    })

    it ('should not be able to create students batch if the pole does not exist', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const student = makeStudent()
      studentsRepository.create(student)

      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      studentsCoursesRepository.create(studentCourse)

      const pole = makePole()
      polesRepository.create(pole)

      const data = {
        courseName: course.name.value,
        userId: '',
        userIp: '',
        fileName: '',
        fileLink: '',
        students: [
          {
            username: 'John Doe',
            cpf: '222.000.222-00',
            email: student.email.value,
            civilId: 12345,
            poleName: pole.name.value,
            birthday: new Date(2003)
          },
          {
            username: 'Josh Ned',
            cpf: '111.000.000-00',
            email: 'johned@acne.com',
            civilId: 23456,
            poleName: 'not-found',
            birthday: new Date(2003)
          }
        ]
      }

      const result = await sut.execute(data)

      expect(result.isLeft()).toBe(true)
    })

    it ('should be able to create students batch and assign in the course and pole', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const pole1 = makePole()
      polesRepository.create(pole1)

      const pole2 = makePole()
      polesRepository.create(pole2)

      const data = {
        courseName: course.name.value,
        userId: '',
        userIp: '',
        fileName: '',
        fileLink: '',
        students: [
          {
            username: 'John Doe',
            cpf: '222.000.222-00',
            email: 'john@acne.com',
            civilId: 12345,
            poleName: pole1.name.value,
            birthday: new Date(2003)
          },
          {
            username: 'Josh Ned',
            cpf: '111.000.000-00',
            email: 'joshned@acne.com',
            civilId: 23456,
            poleName: pole2.name.value,
            birthday: new Date(2003)
          }
        ]
      }

      const result = await sut.execute(data)

      expect(result.isRight()).toBe(true)
      expect(studentsBatchRepository.items).toHaveLength(1)
      expect(studentsBatchRepository.items).toMatchObject([
        {
          students: [
            {
              student: {
                id: {
                  value: expect.any(String)
                },
                username: {
                  value: 'John Doe'
                },
                email: {
                  value: 'john@acne.com'
                }
              }
            },
            {
              student: {
                id: {
                  value: expect.any(String)
                },
                username: {
                  value: 'Josh Ned'
                },
                email: {
                  value: 'joshned@acne.com'
                }
              }
            },
          ]
        }
      ])
    })
  })
})