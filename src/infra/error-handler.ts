import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { ClientError } from './http/errors/client-error.ts'
import { Conflict } from './http/errors/conflict-error.ts'
import { NotFound } from './http/errors/not-found.ts'
import { UnauthorizedError } from './http/errors/unauthorized-error.ts'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _, res) => {
  if (error instanceof ZodError) {
    return res.status(400).send({
      message: 'Error during validation',
      errors: fromZodError(error),
    })
  }

  if (error instanceof UnauthorizedError) {
    return res.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof Conflict) {
    return res.status(409).send({
      message: error.message,
    })
  }

  if (error instanceof ClientError) {
    return res.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof NotFound) {
    return res.status(400).send({
      message: error.message,
    })
  }

  return res.status(500).send({ message: 'Internal server error!' })
}