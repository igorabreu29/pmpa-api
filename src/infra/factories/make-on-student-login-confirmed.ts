import { OnStudentLoginConfirmed } from "@/domain/report/app/subscribers/on-student-login-confirmed.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnStudentLoginConfirmed() {
  const sendReportUseCase = makeSendReportUseCase()
  return new OnStudentLoginConfirmed (
    sendReportUseCase
  )
}