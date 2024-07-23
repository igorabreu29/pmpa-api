import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { ClientError } from './http/errors/client-error.ts'
import { ConflictError } from './http/errors/conflict-error.ts'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _, res) => {
  if (error instanceof ZodError) {
    return res.status(400).send({
      message: 'Error during validation',
      errors: fromZodError(error),
    })
  }

  if (error instanceof ConflictError) {
    return res.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof ClientError) {
    return res.status(400).send({
      message: error.message,
    })
  }

  return res.status(500).send({ message: 'Internal server error!' })
}