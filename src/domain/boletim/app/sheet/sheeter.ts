interface WriteProps {
  rows: [],
  courseName: string
}

export interface Sheeter {
  write: ({ courseName, rows }: WriteProps) => {
    url: string
  }
}