import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { upload } from "@/infra/libs/multer.ts";
import { z } from "zod";

export async function uploadAttachment(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/upload', {
      onRequest: [verifyJWT],
      preHandler: upload.single('attachment')
    }, async (req, res) => {
      const assessmentFileSchema = z.object({
        filename: z.string(),
      })
  
      const { filename } = assessmentFileSchema.parse(req.file)
      
      const fullUrl = req.protocol.concat('://').concat(req.host)
      const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

      return res.status(201).send({
        fileUrl
      })
    })
}