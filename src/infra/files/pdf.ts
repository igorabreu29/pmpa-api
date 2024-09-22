import { PDF, PDFCreateProps } from "@/domain/boletim/app/files/pdf.ts";
import { join } from "path";
import fs from 'fs'
import { dayjs } from '../libs/dayjs.ts'
import puppeteer from "puppeteer";
import { getBehaviorAverageStatus } from "@/domain/boletim/app/utils/get-behavior-average-status.ts";
import qrcode from 'qrcode'
import bcrypt from 'bcryptjs'

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
            ${rows.grades.studentAverage.assessments[key]?.avi ?? ''}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.studentAverage.assessments[key]?.avii ?? ''}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.studentAverage.assessments[key]?.vf}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.studentAverage.assessments[key]?.vfe ?? ''}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.studentAverage.assessments[key]?.average}
          </td>
          <td class="text-sm font-bold">
            ${rows.grades.studentAverage.assessments[key]?.status}
          </td>
        </tr>
      `
    })

    const average = 
      rows.grades.studentAverage.averageInform.behaviorAverageStatus.reduce((acc, item) => acc + item.behaviorAverage, 0) / 
        rows.grades.studentAverage.averageInform.behaviorAverageStatus.length
      
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

    const assessmentsSecondSeasonQuantity = rows.grades.studentAverage.assessments.filter(assessment => assessment?.vf).length

    const historicHash = bcrypt.hash(`${rows.course.name.value} - PMPA`, 6)

    qrcode.toString(`http://localhost:5173/validateDocument?historic=${rows.courseHistoric.id.toValue()}&hash=${historicHash}`,{ type: 'svg'}, (err,url) => {
      const svg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" shape-rendering="crispEdges">
          <path fill="#ffffff" d="M0 0h45v45H0z"/>
          <path stroke="#000000" d="M4 4.5h7m1 0h2m1 0h2m2 0h1m1 0h1m2 0h1m1 0h1m2 0h2m3 0h7M4 5.5h1m5 0h1m2 0h2m2 0h1m4 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m1 0h4m2 0h1m1 0h2m1 0h1m1 0h3m1 0h3m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m3 0h2m3 0h1m1 0h2m1 0h4m1 0h1m2 0h1m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m2 0h1m6 0h3m2 0h2m2 0h1m4 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m1 0h1m2 0h1m3 0h1m4 0h1m3 0h1m1 0h1m1 0h1m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M13 11.5h1m6 0h1m2 0h1m2 0h1m4 0h1M4 12.5h1m1 0h1m3 0h2m3 0h2m1 0h3m2 0h2m2 0h2m1 0h3m2 0h1m2 0h1m1 0h1M6 13.5h1m1 0h2m2 0h3m2 0h1m2 0h2m1 0h3m1 0h1m1 0h6m4 0h2M5 14.5h6m1 0h1m2 0h1m4 0h2m1 0h1m1 0h3m2 0h2m5 0h1m2 0h1M4 15.5h1m1 0h1m1 0h2m2 0h3m1 0h5m1 0h1m1 0h1m1 0h1m5 0h4m1 0h1M7 16.5h1m2 0h3m1 0h1m1 0h1m1 0h1m4 0h2m2 0h2m1 0h1m3 0h2m1 0h1m2 0h1M5 17.5h1m1 0h1m4 0h1m2 0h3m1 0h2m2 0h2m2 0h2m1 0h3m1 0h2m1 0h1m1 0h2M6 18.5h2m1 0h2m1 0h5m1 0h2m1 0h3m2 0h3m2 0h1m1 0h1m1 0h4m1 0h1M5 19.5h2m4 0h1m1 0h1m1 0h3m4 0h3m2 0h2m2 0h2m2 0h3m1 0h2M7 20.5h2m1 0h2m3 0h2m3 0h1m3 0h1m1 0h2m2 0h1m1 0h3M4 21.5h1m1 0h1m1 0h2m1 0h1m1 0h1m2 0h3m4 0h2m1 0h2m2 0h2m1 0h2m3 0h3M4 22.5h1m4 0h4m3 0h2m1 0h3m1 0h1m1 0h1m1 0h3m1 0h1m1 0h4m1 0h1m1 0h1M4 23.5h2m1 0h1m1 0h1m2 0h2m1 0h3m1 0h1m2 0h1m4 0h1m2 0h1m2 0h2m1 0h2M4 24.5h1m1 0h1m2 0h2m4 0h1m3 0h2m2 0h2m2 0h1m2 0h3m1 0h2m1 0h1m1 0h1M5 25.5h1m1 0h1m4 0h5m1 0h3m2 0h2m2 0h2m1 0h3m1 0h2m4 0h1M4 26.5h1m2 0h2m1 0h6m1 0h1m1 0h3m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m2 0h2m1 0h1M5 27.5h1m2 0h2m1 0h1m5 0h2m5 0h1m1 0h3m4 0h4M5 28.5h1m4 0h4m6 0h5m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m5 0h1M6 29.5h1m1 0h2m3 0h1m3 0h1m2 0h5m1 0h3m2 0h2m1 0h1m5 0h1M4 30.5h4m1 0h3m1 0h1m2 0h2m1 0h1m3 0h1m1 0h3m1 0h8m3 0h1M7 31.5h3m4 0h1m1 0h1m1 0h3m5 0h1m1 0h1m1 0h4m2 0h1m2 0h2M4 32.5h2m1 0h1m1 0h2m1 0h3m1 0h2m2 0h1m2 0h2m2 0h2m1 0h7M12 33.5h3m1 0h2m1 0h2m1 0h1m1 0h1m1 0h2m1 0h2m1 0h1m3 0h1m1 0h3M4 34.5h7m1 0h8m1 0h3m1 0h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h2m2 0h1M4 35.5h1m5 0h1m2 0h4m2 0h2m3 0h1m1 0h2m2 0h3m3 0h1m2 0h2M4 36.5h1m1 0h3m1 0h1m3 0h5m2 0h3m2 0h3m1 0h8m1 0h2M4 37.5h1m1 0h3m1 0h1m2 0h1m1 0h3m1 0h1m2 0h2m3 0h2m1 0h1m2 0h1m2 0h3M4 38.5h1m1 0h3m1 0h1m1 0h1m2 0h2m3 0h2m1 0h1m1 0h1m1 0h2m4 0h1m1 0h2m1 0h1m1 0h1M4 39.5h1m5 0h1m2 0h2m5 0h1m3 0h1m3 0h1m1 0h3m2 0h2M4 40.5h7m1 0h1m4 0h1m1 0h1m2 0h1m1 0h1m2 0h1m2 0h4m6 0h1"/>
        </svg>
      `

      htmlContent = htmlContent.replace(
        '{{ dynamic_qr_code }}', svg.trim()
      )
    })
    
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
      .replace('{{ dynamic_average }}', String(rows.grades.studentAverage.averageInform.geralAverage))
      .replace('{{ dynamic_concept }}', String(rows.grades.studentAverage.averageInform.studentAverageStatus.concept))
      .replace('{{ dynamic_classification }}', String(rows.studentClassification))

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