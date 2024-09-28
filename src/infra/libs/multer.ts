import multer from 'fastify-multer'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

export const upload = multer({
    dest: resolve(cwd(), './uploads'),
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, resolve(cwd(), './uploads'))
        },
        filename: (req, file, callback) => {
            const fileName = file.originalname
            callback(null, fileName)
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/pjpeg',
            'image/gif',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]

        if (!allowedMimes.includes(file.mimetype)) {
            callback(new Error('Invalid form'))
            return
        }

        callback(null, true)
    }
})