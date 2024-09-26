import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { makePrismaCourse } from "test/factories/make-course.ts";
import { makePrismaStudent } from "test/factories/make-student.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";

import { Pole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from 'supertest'
import bcrypt from 'bcryptjs'

let course: Course
let pole: Pole

describe('Create Students Information By Manager Sheet (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()
    pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })
    
    await makePrismaStudent({
      data: {},
      courseId: course.id.toValue(),
      poleId: pole.id
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST manager/students/sheet', async () => {
    await prisma.user.create({
      data: {
        username: 'Manager Test',
        civilId: '02345',
        cpf: '00000000001',
        email: 'managertest@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('1999/02/01'),
        role: 'MANAGER',
        
        usersOnCourses: {
          create: {
            courseId: course.id.toValue(),
             usersOnPoles: {
              create: {
                poleId: pole.id
              }
            }
          }
        }
      },
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-01',
        password: 'node-20'
      })

    const { token }: { token: string } = authenticateResponse.body

    const response = await request(app.server)
      .post(`/manager/students/sheet`)
      .send({
        courseId: course.id.toValue()
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
  })
})