import { fastify } from 'fastify'
import { randomUUID } from 'node:crypto'
import { fastifyCors } from '@fastify/cors'
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

  dispatchOrderCreated({
    orderId,
    amount,
    customer: {
      id: 'd37af18e-b3a7-4c35-90bb-aef7052db36f'
    }
  })

  try {
    await db.insert(schema.orders).values({
      id: orderId,
      customerId: 'd37af18e-b3a7-4c35-90bb-aef7052db36f',
      amount,
    })
  } catch (err) {
    console.log(err)
  }

  return reply.status(201).send({})
})

app.listen({
  host: '0.0.0.0',
  port: 3333
}).then(() => {
  console.log('[Orders] Http Server running on port 3333!!!')
})

