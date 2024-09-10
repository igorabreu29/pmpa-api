import { Sheeter, WriteProps } from "@/domain/boletim/app/sheet/sheeter.ts";
import { utils, writeFile } from "../libs/xlsx.ts";

export class XLSXSheeter implements Sheeter {
  write({ rows, keys, sheetName  }: WriteProps) {
    const workbook = utils.book_new()
    const worksheet = utils.json_to_sheet(rows)
    utils.book_append_sheet(workbook, worksheet, "S")

    utils.sheet_add_aoa(worksheet, [keys], { origin: "A1" })

    writeFile(workbook, `./uploads/${sheetName}`, { compression: true })

    return {
      filename: sheetName
    }
  }
}