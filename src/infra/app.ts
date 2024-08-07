import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { env } from "./env/index.ts";
import { authenticate } from "./http/controllers/authenticate.ts";
import { createStudent } from "./http/controllers/create-student.ts";
import { errorHandler } from "./error-handler.ts";
import { resolve } from "node:path";
import { createStudentsBatch } from "./http/controllers/create-students-batch.ts";
import { deleteStudent } from "./http/controllers/delete-student.ts";
import { updateStudent } from "./http/controllers/update-student.ts";
import { createManager } from "./http/controllers/create-manager.ts";
import { deleteManager } from "./http/controllers/delete-manager.ts";
import { updateManager } from "./http/controllers/update-manager.ts";
import { createAdministrator } from "./http/controllers/create-administrator.ts";
import { updateAdministrator } from "./http/controllers/update-administrator.ts";
import { deleteAdministrator } from "./http/controllers/delete-administrator.ts";
import { createDeveloper } from "./http/controllers/create-developer.ts";
import { changeStudentStatus } from "./http/controllers/change-student-status.ts";
import { changeManagerStatus } from "./http/controllers/change-manager-status.ts";
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

export const app = fastify()

app.register(import('@fastify/jwt'), {
  secret: env.JWT_SECRET
})
app.register(import('@fastify/static'), {
  root: resolve(import.meta.dirname, '../uploads'),
  prefix: "/uploads"
})
app.register(import('@fastify/multipart'))

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(authenticate)
app.register(createStudent)
app.register(createStudentsBatch)
app.register(updateStudent)
app.register(changeStudentStatus)
app.register(deleteStudent)
app.register(createManager)
app.register(deleteManager)
app.register(updateManager)
app.register(changeManagerStatus)
app.register(createAdministrator)
app.register(updateAdministrator)
app.register(deleteAdministrator)
app.register(createDeveloper)
app.register(createAssessment)
app.register(createAssessmentBatch)
app.register(updateAssessment)
app.register(deleteAssessment)
app.register(createBehavior)
app.register(createBehaviorBatch)
app.register(updateBehavior)
app.register(deleteBehavior)
app.register(createCourse)
app.register(createCoursePole)
app.register(createCourseDiscipline)
app.register(createCourseHistoric)
app.register(getStudentProfile)
app.register(getManagerProfile)
app.register(getAdministratorProfile)
app.register(getDeveloperProfile)
app.register(getStudentCourses)
app.register(getCourseStudents)
app.register(getCourseStudentsByPole)
app.register(getManagerCourses)
app.register(getCourseManagers)
app.register(getCoursePoles)
app.register(getLoginConfirmationMetrics)
app.register(getLoginConfirmationMetricsByManager)
app.register(changeStudentProfile)
app.register(changeManagerProfile)
app.register(changeAdministratorProfile)
app.register(changeDeveloperProfile)
app.register(getPoles)
app.register(getCourses)
app.register(studentConfirmLoginAndUpdate)
app.register(getStudentAverage)

app.setErrorHandler(errorHandler)