export function transformDate(dateToTransform: string) {
  const [year, month, day] = dateToTransform.split('/')

  const date = new Date()
  date.setFullYear(Number(year), Number(month), Number(day))

  return date
}