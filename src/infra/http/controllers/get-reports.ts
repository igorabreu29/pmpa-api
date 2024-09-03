import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { makeFetchReportsUseCase } from "@/infra/factories/make-fetch-reports-use-case.ts";
import { ReportPresenter } from "../presenters/report-presenter.ts";

export async function getReports(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/reports', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        querystring: z.object({
          action: z.enum(['add', 'remove', 'update', 'login confirmed']).optional(),
          page: z.coerce.number().default(1)
        })
      }
    }, async (req, res) => {
      const { action, page } = req.query

      const useCase = makeFetchReportsUseCase()
      const result = await useCase.execute({ action, page })

      if (result.isLeft()) {
        throw new ClientError('Ocurred something error')
      }

      const { reports, pages, totalItems } = result.value

      return res.status(200).send({
        reports: reports.map(report => ReportPresenter.toHTTP(report)),
        pages,
        totalItems
      })
    })
} 