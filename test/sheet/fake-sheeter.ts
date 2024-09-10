import { Sheeter, WriteProps } from "@/domain/boletim/app/sheet/sheeter.ts";

export class FakeSheeter implements Sheeter {
  write({ sheetName }: WriteProps): { filename: string } {
    return {
      filename: sheetName
    }
  }
}