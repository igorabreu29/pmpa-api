import 'dotenv/config'

import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from "./env/index.ts";
import { authenticate } from "./http/controllers/authenticate.ts";
import { createStudent } from "./http/controllers/create-student.ts";
import { errorHandler } from "./error-handler.ts";
import { join } from "node:path";
import { createStudentBatch } from "./http/controllers/create-students-batch.ts";
import { deleteStudent } from "./http/controllers/delete-student.ts";
import { updateStudent } from "./http/controllers/update-student.ts";
import { createManager } from "./http/controllers/create-manager.ts";
import { deleteManager } from "./http/controllers/delete-manager.ts";
import { updateManager } from "./http/controllers/update-manager.ts";
import { createAdministrator } from "./http/controllers/create-administrator.ts";
import { updateAdministrator } from "./http/controllers/update-administrator.ts";
import { deleteAdministrator } from "./http/controllers/delete-administrator.ts";
import { createDeveloper } from "./http/controllers/create-developer.ts";
import { createAssessment } from "./http/controllers/create-assessment.ts";
import { createAssessmentBatch } from "./http/controllers/create-assessments-batch.ts";
import { createBehavior } from "./http/controllers/create-behavior.ts";
import { createBehaviorBatch } from "./http/controllers/create-behaviors-batch.ts";
import { createCourse } from "./http/controllers/create-course.ts";
import { createCoursePole } from "./http/controllers/create-course-pole.ts";
import { createCourseDiscipline } from "./http/controllers/create-course-discipline.ts";
import { createCourseHistoric } from "./http/controllers/create-course-historic.ts";
import { updateAssessment } from "./http/controllers/update-assessment.ts";
import { deleteAssessment } from "./http/controllers/delete-assessment.ts";
import { updateBehavior } from "./http/controllers/update-behavior.ts";
import { deleteBehavior } from "./http/controllers/delete-behavior.ts";
import { getStudentProfile } from "./http/controllers/get-student-profile.ts";
import { getManagerProfile } from "./http/controllers/get-manager-profile.ts";
import { getAdministratorProfile } from "./http/controllers/get-administrator-profile.ts";
import { getDeveloperProfile } from "./http/controllers/get-developer-profile.ts";
import { getStudentCourses } from "./http/controllers/get-student-courses.ts";
import { getCourseStudents } from "./http/controllers/get-course-students.ts";
import { getCourseManagers } from "./http/controllers/get-course-managers.ts";
import { getManagerCourses } from "./http/controllers/get-manager-courses.ts";
import { getCoursePoles } from "./http/controllers/get-course-poles.ts";
import { getCourseStudentsByPole } from "./http/controllers/get-course-students-by-pole.ts";
import { getLoginConfirmationMetrics } from "./http/controllers/get-login-confirmation-metrics.ts";
import { getLoginConfirmationMetricsByManager } from "./http/controllers/get-login-confirmation-metrics-by-manager.ts";
import { changeStudentProfile } from "./http/controllers/change-student-profile.ts";
import { changeManagerProfile } from "./http/controllers/change-manager-profile.ts";
import { getPoles } from "./http/controllers/get-poles.ts";
import { getCourses } from "./http/controllers/get-courses.ts";
import { changeAdministratorProfile } from "./http/controllers/change-administrator-profile.ts";
import { changeDeveloperProfile } from "./http/controllers/change-developer-profile.ts";
import { getStudentAverage } from "./http/controllers/get-student-average.ts";
import { studentConfirmLoginAndUpdate } from "./http/controllers/student-confirm-login-and-update.ts";
import { searchStudentCourseDetails } from "./http/controllers/search-student-course-details.ts";
import { searchStudentCourseByPoleDetails } from "./http/controllers/search-student-course-by-pole-details.ts";
import { searchStudentsCourseByManagerDetails } from "./http/controllers/search-students-course-by-manager.ts";
import { search } from "./http/controllers/search.ts";
import { getCourseDisciplines } from "./http/controllers/get-course-disciplines.ts";
import { getDisciplines } from "./http/controllers/get-disciplines.ts";
import { updateAssessmentBatch } from "./http/controllers/update-assessments-batch.ts";
import { updateBehaviorBatch } from "./http/controllers/update-behaviors-batch.ts";
import { updateStudentBatch } from "./http/controllers/update-students-batch.ts";
import { changeStudentAvatar } from "./http/controllers/change-student-avatar.ts";
import { changeManagerAvatar } from "./http/controllers/change-manager-avatar.ts";
import { changeAdministratorAvatar } from "./http/controllers/change-administrator-avatar.ts";
import { changeDeveloperAvatar } from "./http/controllers/change-developer-avatar.ts";
import { getClassification } from "./http/controllers/get-classification.ts";
import { getClassificationByPole } from "./http/controllers/get-classification-by-pole.ts";
import { getClassificationByManager } from "./http/controllers/get-classification-by-manager.ts";
import { getBehaviorClassification } from "./http/controllers/get-behavior-classification.ts";
import { removeAssessmentGrade } from "./http/controllers/remove-assessment-grade.ts";
import { removeAssessmentsGradeBatch } from "./http/controllers/remove-assessments-grade-batch.ts";
import { getReports } from "./http/controllers/get-reports.ts";
import { uploadAttachment } from "./http/controllers/upload-attachment.ts";
import { getAdministrators } from "./http/controllers/get-administrators.ts";
import { getCourseStudent } from "./http/controllers/get-course-student.ts";
import { getManagerReports } from "./http/controllers/get-manager-reports.ts";
import { activeStudent } from "./http/controllers/active-student.ts";
import { disableStudent } from "./http/controllers/disable-student.ts";
import { activeManager } from "./http/controllers/active-manager.ts";
import { disableManager } from "./http/controllers/disable-manager.ts";
import { createDiscipline } from "./http/controllers/create-discipline.ts";
import { updateDiscipline } from "./http/controllers/update-discipline.ts";
import { deleteDiscipline } from "./http/controllers/delete-discipline.ts";
import { getCourse } from "./http/controllers/get-course.ts";
import { updateCourse } from "./http/controllers/update-course.ts";
import { deleteCourse } from "./http/controllers/delete-course.ts";
import { deleteCourseHistoric } from "./http/controllers/delete-course-historic.ts";
import { getAssessmentClassification } from "./http/controllers/get-assessment-classification.ts";
import { getCourseManager } from "./http/controllers/get-course-manager.ts";
import { cwd } from "node:process";
import { createCourseSummarySheet } from "./http/controllers/create-course-summary-sheet.ts";
import { removeBehaviorGrade } from "./http/controllers/remove-behavior-grade.ts";
import { getCourseBehaviors } from "./http/controllers/get-course-behaviors.ts";
import { getAverageClassificationCoursePoles } from "./http/controllers/get-average-classification-course-poles.ts";
import { removeBehaviorsGradeBatch } from "./http/controllers/remove-behaviors-grade-batch.ts";
import { getCourseStudentsByManager } from "./http/controllers/get-course-students-by-manager.ts";
import { downloadCourseHistoric } from "./http/controllers/download-course-historic.ts";
import { createClassificationSheet } from "./http/controllers/create-classification-sheet.ts";
import { createClassificationByPoleSheet } from "./http/controllers/create-classification-by-pole-sheet.ts";
import { createAssessmentClassificationSheet } from "./http/controllers/create-assessment-classification-sheet.ts";
import { createBehaviorClassificationSheet } from "./http/controllers/create-behavior-classification-sheet.ts";
import { createClassificationByManagerSheet } from "./http/controllers/create-classification-by-manager-sheet.ts";
import { createAverageClassificationCoursePolesSheet } from "./http/controllers/create-average-classification-course-poles-sheet.ts";
import { deleteCourseDiscipline } from "./http/controllers/delete-course-discipline.ts";
import { deleteCoursePole } from "./http/controllers/delete-course-pole.ts";
import { validateCourseHistoric } from "./http/controllers/validate-course-historic.ts";
import { getSubClassification } from "./http/controllers/get-sub-classification.ts";
import { getSubClassificationByPole } from "./http/controllers/get-sub-classification-by-pole.ts";
import { getSubClassificationByManager } from "./http/controllers/get-sub-classification-by-manager.ts";
import { activeAdministrator } from "./http/controllers/active-administrator.ts";
import { disableAdministrator } from "./http/controllers/disable-administrator.ts";
import { restorePassword } from "./http/controllers/restore-password.ts";
import { forgotPassword } from "./http/controllers/forgot-password.ts";
import { createSubClassificationSheet } from "./http/controllers/create-sub-classification-sheet.ts";
import { createSubClassificationByPoleSheet } from "./http/controllers/create-sub-classification-by-pole-sheet.ts";
import { createSubClassificationByManagerSheet } from "./http/controllers/create-sub-classification-by-manager-sheet.ts";
import { createStudentsInformationSheet } from "./http/controllers/create-students-information-sheet.ts";
import { createStudentsInformationByManagerSheet } from "./http/controllers/create-students-information-by-manager-sheet.ts";
import { deleteStudentCourse } from "./http/controllers/delete-student-course.ts";
import { deleteManagerCourse } from "./http/controllers/delete-manager-course.ts";
import { getCourseAssessments } from "./http/controllers/get-course-assessments.ts";
import { changeUserRole } from './http/controllers/change-user-role.ts';

export const app = fastify()
app.register(import("@fastify/cors"), {
  origin: [
    'https://boletim-app-2-0.onrender.com/',
    env.WEB_URL
  ],
  credentials: true
})
app.register(import('@fastify/jwt'), {
  secret: env.JWT_SECRET
})

app.register(import('@fastify/static'), {
  root: join(cwd(), '/uploads'),
  prefix: "/uploads"
})
app.register(import('@fastify/multipart'))

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(authenticate)
app.register(restorePassword)
app.register(forgotPassword)
app.register(changeUserRole)
app.register(createStudentsInformationSheet)
app.register(createStudentsInformationByManagerSheet)
app.register(createStudent)
app.register(createStudentBatch)
app.register(activeStudent)
app.register(disableStudent)
app.register(updateStudent)
app.register(updateStudentBatch)
app.register(changeStudentProfile)
app.register(changeStudentAvatar)
app.register(deleteStudent)
app.register(deleteStudentCourse)
app.register(createManager)
app.register(activeManager)
app.register(disableManager)
app.register(deleteManager)
app.register(deleteManagerCourse)
app.register(updateManager)
app.register(changeManagerProfile)
app.register(changeManagerAvatar)
app.register(getAdministrators)
app.register(createAdministrator)
app.register(activeAdministrator)
app.register(disableAdministrator)
app.register(updateAdministrator)
app.register(changeAdministratorProfile)
app.register(changeAdministratorAvatar)
app.register(deleteAdministrator)
app.register(createDeveloper)
app.register(changeDeveloperProfile)
app.register(changeDeveloperAvatar)
app.register(getCourseAssessments)
app.register(createAssessment)
app.register(createAssessmentBatch)
app.register(updateAssessment)
app.register(updateAssessmentBatch)
app.register(removeAssessmentGrade)
app.register(removeAssessmentsGradeBatch)
app.register(deleteAssessment)
app.register(getCourseBehaviors)
app.register(createBehavior)
app.register(createBehaviorBatch)
app.register(updateBehavior)
app.register(updateBehaviorBatch)
app.register(removeBehaviorGrade)
app.register(removeBehaviorsGradeBatch)
app.register(deleteBehavior)
app.register(getCourses)
app.register(getCourse)
app.register(createCourse)
app.register(updateCourse)
app.register(deleteCourse)
app.register(createCoursePole)
app.register(deleteCoursePole)
app.register(createCourseDiscipline)
app.register(deleteCourseDiscipline)
app.register(createCourseHistoric)
app.register(deleteCourseHistoric)
app.register(downloadCourseHistoric)
app.register(validateCourseHistoric)
app.register(getStudentProfile)
app.register(getManagerProfile)
app.register(getAdministratorProfile)
app.register(getDeveloperProfile)
app.register(getStudentCourses)
app.register(getCourseStudents)
app.register(getCourseStudent)
app.register(getCourseStudentsByPole)
app.register(getCourseStudentsByManager)
app.register(getManagerCourses)
app.register(getCourseManager)
app.register(getCourseManagers)
app.register(getCoursePoles)
app.register(getCourseDisciplines)
app.register(getLoginConfirmationMetrics)
app.register(getLoginConfirmationMetricsByManager)
app.register(getPoles)
app.register(getDisciplines)
app.register(studentConfirmLoginAndUpdate)
app.register(getStudentAverage)
app.register(searchStudentCourseDetails)
app.register(searchStudentCourseByPoleDetails)
app.register(searchStudentsCourseByManagerDetails)
app.register(search)
app.register(getClassification)
app.register(getSubClassification)
app.register(getClassificationByPole)
app.register(getSubClassificationByPole)
app.register(getAverageClassificationCoursePoles)
app.register(getClassificationByManager)
app.register(getSubClassificationByManager)
app.register(getAssessmentClassification)
app.register(getBehaviorClassification)
app.register(getReports)
app.register(getManagerReports)
app.register(uploadAttachment)
app.register(createDiscipline)
app.register(updateDiscipline)
app.register(deleteDiscipline)
app.register(createCourseSummarySheet)
app.register(createClassificationSheet)
app.register(createClassificationByPoleSheet)
app.register(createClassificationByManagerSheet)
app.register(createSubClassificationSheet)
app.register(createSubClassificationByPoleSheet)
app.register(createSubClassificationByManagerSheet)
app.register(createAssessmentClassificationSheet)
app.register(createBehaviorClassificationSheet)
app.register(createAverageClassificationCoursePolesSheet)

app.setErrorHandler(errorHandler)