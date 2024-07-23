import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { env } from "./env/index.ts";
import { errorHandler } from "./error-handler.ts";
import { authenticate } from "./http/controllers/authenticate.ts";

export const app = fastify()

app.register(import('@fastify/jwt'), {
  secret: env.JWT_SECRET
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(authenticate)

app.setErrorHandler(errorHandler)