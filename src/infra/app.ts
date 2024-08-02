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
import { changeAdministratorStatus } from "./http/controllers/change-administrator-status.ts";
import { createAssessment } from "./http/controllers/create-assessment.ts";
import { createAssessmentBatch } from "./http/controllers/create-assessments-batch.ts";
import { createBehavior } from "./http/controllers/create-behavior.ts";
import { createBehaviorBatch } from "./http/controllers/create-behaviors-batch.ts";

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
app.register(changeAdministratorStatus)
app.register(deleteAdministrator)
app.register(createDeveloper)
app.register(createAssessment)
app.register(createAssessmentBatch)
app.register(createBehavior)
app.register(createBehaviorBatch)

app.setErrorHandler(errorHandler)