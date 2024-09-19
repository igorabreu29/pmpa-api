import { PDF, PDFCreateProps } from "@/domain/boletim/app/files/pdf.ts";

export class FakePDF implements PDF {
  async create({ rows }: PDFCreateProps) {
    return {
      filename: `${rows.course.name.value} - Academic Record.pdf`
    }
  }
}