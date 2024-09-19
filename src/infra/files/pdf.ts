import { PDF, PDFCreateProps } from "@/domain/boletim/app/files/pdf.ts";
import { join } from "path";
import fs from 'fs'
import { dayjs } from '../libs/dayjs.ts'
import puppeteer from "puppeteer";
import { getBehaviorAverageStatus } from "@/domain/boletim/app/utils/get-behavior-average-status.ts";

export class GeneratePDF implements PDF {
  async create({ rows }: PDFCreateProps) {
    const htmlFilePath = join(import.meta.dirname, '../html/template.html')
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8')

    const list = rows.courseWithDisciplines.map((discipline, key) => {
      return `
        <tr>
          <td class="text-sm font-bold">
            ${discipline.disciplineName}
          </td>
          <td class="text-sm font-bold">
            N/A
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.assessments[key]?.avi ?? ''}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.assessments[key]?.avii ?? ''}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.assessments[key]?.vf}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.assessments[key]?.vfe ?? ''}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.assessments[key]?.average}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.assessments[key]?.status}
          </td>
        </tr>
      `
    })

    const average = 
      rows.grades.averageInform.behaviorAverageStatus.reduce((acc, item) => acc + item.behaviorAverage, 0) / 
        rows.grades.averageInform.behaviorAverageStatus.length
      
    const { behaviorAverage, status } = getBehaviorAverageStatus(average)

    list.push(`
        <tr>
          <td class="text-sm font-bold">
            Comportamento Escolar
          </td>
          <td class="text-sm font-bold">
            N/A
          </td>
          <td class="text-sm font-bold">
          </td>
          <td class="text-sm font-bold">
          </td>
          <td class="text-sm font-bold">
          </td>
          <td class="text-sm font-bold">
          </td>
          <td class="text-sm font-bold">
            ${behaviorAverage}
          </td>
          <td class="text-sm font-bold">
            ${status}
          </td>
        </tr>
    `)

    const dynamic = {
      list: list.join('')
    }

    const currentDate = dayjs(new Date()).format('DD/MM/YYYY')
    const startAt = dayjs(rows.course.startAt).format('DD/MM/YYYY')
    const endsAt = dayjs(rows.course.endsAt.value).format('DD/MM/YYYY')
    const birthday = dayjs(rows.student.birthday.value).format('DD/MM/YYYY')

    const assessmentsSecondSeasonQuantity = rows.grades.assessments.filter(assessment => assessment?.vf).length
    
    htmlContent = htmlContent
      .replaceAll('{{ dynamic_course }}', rows.course.name.value)
      .replace('{{ dynamic_course_startAt }}', startAt)
      .replace('{{ dynamic_course_endsAt }}', endsAt)
      .replace('{{ dynamic_student_username }}', rows.student.username.value)
      .replace('{{ dynamic_student_militaryId }}', rows.student.militaryId ?? '')
      .replace('{{ dynamic_student_father }}', rows.student.parent?.fatherName ?? '')
      .replace('{{ dynamic_student_mother }}', rows.student.parent?.motherName ?? '')
      .replace('{{ dynamic_student_birthday }}', birthday)
      .replace('{{ dynamic_student_county }}', rows.student.county ?? '')
      .replace('{{ dynamic_student_state }}', rows.student.state ?? '')
      .replace('{{ dynamic_list }}', dynamic.list)
      .replace('{{ dynamic_second_season_quantity }}', String(assessmentsSecondSeasonQuantity))
      .replace('{{ dynamic_current_date }}', currentDate)
      .replace('{{ dynamic_total_hours }}', String(rows.courseHistoric.totalHours))
      .replace('{{ dynamic_average }}', String(rows.grades.averageInform.geralAverage))
      .replace('{{ dynamic_concept }}', String(rows.grades.averageInform.studentAverageStatus.concept))

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.setContent(htmlContent);

    const filename = 'Histórico Escolar.pdf'
  
    await page.pdf({
      path: './uploads/Histórico Escolar.pdf',
      format: 'A4',
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    })
  
    await browser.close();

    return {
      filename
    }
  }
}