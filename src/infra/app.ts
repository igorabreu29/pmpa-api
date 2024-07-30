import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { env } from "./env/index.ts";
import { authenticate } from "./http/controllers/authenticate.ts";
import { createStudent } from "./http/controllers/create-student.ts";
import { errorHandler } from "./error-handler.ts";
import { resolve } from "node:path";
import { createStudentsBatch } from "./http/controllers/create-students-batch.ts";
import { deleteStudent } from "./http/controllers/delete-student.ts";

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
app.register(deleteStudent)

app.setErrorHandler(errorHandler)