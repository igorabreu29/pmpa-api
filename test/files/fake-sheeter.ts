import { Sheeter, WriteProps } from "@/domain/boletim/app/files/sheeter.ts";

export class FakeSheeter implements Sheeter {
  write({ sheetName }: WriteProps): { filename: string } {
    return {
      filename: sheetName
    }
  }
}