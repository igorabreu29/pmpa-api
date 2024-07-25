import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { env } from "./env/index.ts";
import { authenticate } from "./http/controllers/authenticate.ts";
import { createStudent } from "./http/controllers/create-student.ts";
import { errorHandler } from "./error-handler.ts";

export const app = fastify()

app.register(import('@fastify/jwt'), {
  secret: env.JWT_SECRET
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(authenticate)
app.register(createStudent)

app.setErrorHandler(errorHandler)