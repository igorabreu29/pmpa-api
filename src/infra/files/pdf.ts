import { PDF, PDFCreateProps } from "@/domain/boletim/app/files/pdf.ts";
import { join } from "path";
import fs from 'fs'
import { dayjs } from '../libs/dayjs.ts'
import puppeteer from "puppeteer";

export class GeneratePDF implements PDF {
  async create({ rows }: PDFCreateProps) {
    const htmlFilePath = join(import.meta.dirname, '../html/template.html')
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8')

    const dynamic = {
      list: rows.courseWithDisciplines.map((discipline, key) => {
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
      }).join('')
    }

    const currentDate = dayjs(new Date()).format('DD/MM/YYYY')

    const assessmentsSecondSeasonQuantity = rows.grades.assessments.filter(assessment => assessment?.vf).length
    
    htmlContent = htmlContent
      .replaceAll('{{ dynamic_course }}', rows.course.name.value)
      .replace('{{ dynamic_course_startAt }}', String(rows.course.startAt))
      .replace('{{ dynamic_course_endsAt }}', String(rows.course.endsAt.value))
      .replace('{{ dynamic_student_username }}', rows.student.username.value)
      .replace('{{ dynamic_student_militaryId }}', rows.student.militaryId ?? '')
      .replace('{{ dynamic_student_father }}', rows.student.parent?.fatherName ?? '')
      .replace('{{ dynamic_student_mother }}', rows.student.parent?.motherName ?? '')
      .replace('{{ dynamic_student_birthday }}', String(rows.student.birthday.value))
      .replace('{{ dynamic_student_county }}', rows.student.county ?? '')
      .replace('{{ dynamic_student_state }}', rows.student.state ?? '')
      .replace('{{ dynamic_list }}', dynamic.list)
      .replace('{{ dynamic_second_season_quantity }}', String(assessmentsSecondSeasonQuantity))
      .replace('{{ dynamic_current_date }}', currentDate)

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