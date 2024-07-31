export function transformDate(dateToTransform: string) {
  const [day, month, year] = dateToTransform.split('/')

  const date = new Date()
  date.setFullYear(Number(year), Number(month), Number(day))

  return date
}