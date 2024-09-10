export interface WriteProps {
  keys: string[]
  rows: unknown[]
  sheetName: string
}

export interface Sheeter {
  write: ({ keys, rows, sheetName }: WriteProps) => {
    filename: string
  }
}