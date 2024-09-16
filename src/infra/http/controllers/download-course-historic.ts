import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeGetCourseStudentUseCase } from "@/infra/factories/make-get-course-student-use-case.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import puppeteer from "puppeteer";
import { makeGetCourseUseCase } from "@/infra/factories/make-get-course-use-case.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "@/infra/factories/make-get-student-average-in-the-course-use-case.ts";

import { join } from 'node:path'
import fs from 'node:fs'
import { makeFetchCourseDisciplinesUseCase } from "@/infra/factories/make-fetch-course-disciplines.ts";
import { dayjs } from '@/infra/libs/dayjs.ts'

export async function downloadCourseHistoric(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/download-historic', {
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        }),

        body: z.object({
          studentId: z.string().uuid()
        })
      }
  }, async (req, res) => {
    const { courseId } = req.params
    const { studentId } = req.body

    const getCourseStudent = makeGetCourseStudentUseCase()
    const resultGetCourseStudent = await getCourseStudent.execute({
      courseId,
      id: studentId
    })

    if (resultGetCourseStudent.isLeft()) {
      const error = resultGetCourseStudent.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        default: 
          throw new ClientError('Ocurred something error')
      }
    }

    const getCourse = makeGetCourseUseCase()
    const resultGetCourse = await getCourse.execute({ id: courseId })

    if (resultGetCourse.isLeft()) {
      const error = resultGetCourse.value
      
      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        default: 
          throw new ClientError()
      }
    }

    const getStudentAverage = makeGetStudentAverageInTheCourseUseCase()
    const resultGetStudentAverage = await getStudentAverage.execute({
      courseId: courseId, 
      studentId,
      isPeriod: false
    })

    if (resultGetStudentAverage.isLeft()) {
      const error = resultGetStudentAverage.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        default: 
          throw new ClientError('Ocurred something error')
      }
    }

    const getCourseDisciplines = makeFetchCourseDisciplinesUseCase()
    const resultGetCourseDisciplines = await getCourseDisciplines.execute({
      courseId, 
    })

    if (resultGetCourseDisciplines.isLeft()) {
      const error = resultGetCourseDisciplines.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        default: 
          throw new ClientError('Ocurred something error')
      }
    }

    
    const { student } = resultGetCourseStudent.value
    const { course } = resultGetCourse.value
    const { grades, behaviorMonths } = resultGetStudentAverage.value
    const { disciplines } = resultGetCourseDisciplines.value

    const htmlFilePath = join(import.meta.dirname, '../../html/template.html')
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8')

    const dynamic = {
      list: disciplines.map((discipline, key) => {
        return `
          <tr>
            <td class="text-sm font-bold">
              ${discipline.disciplineName}
            </td>
            <td class="text-sm font-bold">
              N/A
            </td>
            <td class="text-sm font-bold">
              ${grades.assessments[key]?.avi ?? ''}
            </td>
            <td class="text-sm font-bold">
              ${grades.assessments[key]?.avii ?? ''}
            </td>
            <td class="text-sm font-bold">
              ${grades.assessments[key]?.vf}
            </td>
            <td class="text-sm font-bold">
              ${grades.assessments[key]?.vfe ?? ''}
            </td>
            <td class="text-sm font-bold">
              ${grades.assessments[key]?.average}
            </td>
            <td class="text-sm font-bold">
              ${grades.assessments[key]?.status}
            </td>
          </tr>
        `
      }).join('')
    }

    const currentDate = dayjs(new Date()).format('DD/MM/YYYY')
    
    htmlContent = htmlContent
      .replaceAll('{{ dynamic_course }}', course.name.value)
      .replace('{{ dynamic_course_startAt }}', String(course.startAt))
      .replace('{{ dynamic_course_endsAt }}', String(course.endsAt.value))
      .replace('{{ dynamic_student_username }}', student.username)
      .replace('{{ dynamic_student_militaryId }}', student.militaryId ?? '')
      .replace('{{ dynamic_student_father }}', student.parent?.fatherName ?? '')
      .replace('{{ dynamic_student_mother }}', student.parent?.motherName ?? '')
      .replace('{{ dynamic_student_birthday }}', String(student.birthday))
      .replace('{{ dynamic_student_county }}', student.county ?? '')
      .replace('{{ dynamic_student_state }}', student.state ?? '')
      .replace('{{ dynamic_list }}', dynamic.list)
      .replace('{{ dynamic_current_date }}', currentDate)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Set the content of the page
    await page.setContent(htmlContent);
  
    // Generate the PDF and save it
    await page.pdf({
      path: 'Histórico Escolar.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });
  
    // Close the browser
    await browser.close();
  })
}