import { PDF, PDFCreateProps } from "@/domain/boletim/app/files/pdf.ts";
import { join } from "node:path";
import fs from 'node:fs'
import { cwd } from 'node:process'
import { dayjs } from '../libs/dayjs.ts'
import puppeteer from "puppeteer";
import qrcode from 'qrcode'
import bcrypt from 'bcryptjs'
import { behaviorStatusMap, conceptMap, statusMap } from "@/domain/boletim/app/utils/status-and-concept-mapper.ts";

export class GeneratePDF implements PDF {
  async create({ rows }: PDFCreateProps) {
    const htmlFilePath = join(cwd(), './src/infra/html/template.html')
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8')

    const list = rows.courseWithDisciplines.map((discipline, key) => {
      const assessment = rows.grades.assessments.find(item => {
        return item.disciplineId === discipline.disciplineId.toValue()
      })

      if (!assessment) return

      return `
        <tr>
          <td class="text-sm font-bold border border-black rounded">
            ${discipline.disciplineName}
          </td>
          <td class="text-sm font-bold border border-black rounded">
            N/A
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${assessment?.avi?.toFixed(3) ?? ''}
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${assessment?.avii?.toFixed(3) ?? ''}
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${assessment?.vf?.toFixed(3) ?? ''}
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${assessment?.vfe?.toFixed(3) ?? ''}
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${assessment?.average?.toFixed(3)}
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${statusMap[assessment.status]}
          </td>
        </tr>
      `
    })

    list.push(`
        <tr>
          <td class="text-sm font-bold border border-black rounded">
            Comportamento Escolar
          </td>
          <td class="text-sm font-bold border border-black rounded">
            N/A
          </td>
          <td class="text-sm font-bold border border-black rounded">
          </td>
          <td class="text-sm font-bold border border-black rounded">
          </td>
          <td class="text-sm font-bold border border-black rounded">
          </td>
          <td class="text-sm font-bold border border-black rounded">
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${rows.behavior.average.toFixed(rows.course.decimalPlaces ?? 3)}
          </td>
          <td class="text-sm font-bold border border-black rounded">
            ${behaviorStatusMap[rows.behavior.status]}
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

    const assessmentsSecondSeasonQuantity = rows.grades.assessments.filter(assessment => assessment?.vfe).length

    const historicHash = await bcrypt.hash(`${rows.course.name.value} - PMPA`, 6)

    qrcode.toString(`http://localhost:5173/validate-document?historic=${rows.courseHistoric.id.toValue()}&hash=${historicHash}`,{ type: 'svg'}, (err,url) => {
      htmlContent = htmlContent.replace(
        '{{ dynamic_qr_code }}', url.replace('<svg', '<svg width="200" height="150"')
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
      .replace('{{ dynamic_average }}', rows.grades.average.toFixed(3))
      .replace('{{ dynamic_concept }}', String(conceptMap[rows.grades.concept]))
      .replace('{{ dynamic_classification }}', String(rows.studentClassification))
      .replace('{{ dynamic_cmt }}', rows.courseHistoric.commander ?? '')
      .replace('{{ dynamic_division_boss }}', rows.courseHistoric.divisionBoss ?? '')

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