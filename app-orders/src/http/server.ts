import '@opentelemetry/auto-instrumentations-node/register'

import { fastify } from 'fastify'
import { randomUUID } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'
import { fastifyCors } from '@fastify/cors'
import { trace } from '@opentelemetry/api'
import { z } from 'zod'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { channels } from '../broker/chanels/index.ts'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'
import { tracer } from '../tracer/tracer.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*'})

// Health check route
app.get('/health', () => {
  return 'ok'
})

app.post('/orders', {
  schema: {
    body: z.object({
      amount: z.number(),
    })
  }
}, async (request, reply) => {
  const { amount} = request.body

  console.log('Creating an order with amount', amount)

  const orderId = randomUUID()

  try {
    await db.insert(schema.orders).values({
      id: orderId,
      customerId: 'd37af18e-b3a7-4c35-90bb-aef7052db36f',
      amount,
    })
  } catch (err) {
    console.log(err)
  }

  const span = tracer.startSpan('There is a possible error here!!!')
  span.setAttribute('teste', "HELLO WORLD")

  await setTimeout(2000)

  span.end()

  trace.getActiveSpan()?.setAttribute('order_id', orderId)

  dispatchOrderCreated({
    orderId,
    amount,
    customer: {
      id: 'd37af18e-b3a7-4c35-90bb-aef7052db36f'
    }
  })

  return reply.status(201).send({})
})

app.listen({
  host: '0.0.0.0',
  port: 3333
}).then(() => {
  console.log('[Orders] Http Server running on port 3333!!!')
})

