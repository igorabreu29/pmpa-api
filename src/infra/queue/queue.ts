import Queue from 'bull'

import * as jobs from './jobs/index.ts'
import { redisConnection } from '../redis/connection.ts'

const queues = Object.values(jobs).map(job => ({
  bull: new Queue(job.key, { redis: redisConnection.options }),
  name: job.key,
  handle: job.handle,
}))

export default {
  queues,
  add(name: string, { data }: Record<string, unknown>) {
    const queue = this.queues.find(item => item.name === name)
    return queue?.bull.add(data)
  },
  process() {
    return this.queues.forEach(queue => {
      queue.bull.process(queue.handle)

      queue.bull.on('failed', (job, err) => {
        console.log('Job Failed', queue.name, err)
      })
    })
  }
}