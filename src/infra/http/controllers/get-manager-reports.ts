import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { ReportPresenter } from "../presenters/report-presenter.ts";
import { makeFetchManagerReportsUseCase } from "@/infra/factories/make-fetch-manager-reports-use-case.ts";

export async function getManagerReports(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/reports/:courseId/manager', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        }),
        querystring: z.object({
          action: z.enum(['add', 'remove', 'update', 'login confirmed']).default('add'),
          page: z.coerce.number().default(1)
        })
      }
    }, async (req, res) => {
      const { courseId } = req.params
      const { action, page } = req.query
      const { payload } = req.user

      const useCase = makeFetchManagerReportsUseCase()
      const result = await useCase.execute({
        courseId,
        managerId: payload.sub,
        action,
        page
      })

      if (result.isLeft()) {
        throw new ClientError('Ocurred something error')
      }

      const { reports, pages, totalItems } = result.value

      return res.send({
        reports: reports.map(report => ReportPresenter.toHTTP(report)),
        pages,
        totalItems
      })
    })
} 