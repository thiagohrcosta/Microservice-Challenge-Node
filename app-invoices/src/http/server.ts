import '../broker/subscriber.ts'

import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { z } from 'zod'

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'


const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*'})

// Health check route
app.get('/health', () => {
  return 'ok'
})


app.listen({
  host: '0.0.0.0',
  port: 3334
}).then(() => {
  console.log('[Invoices] Http Server running on port 3334!!!')
})

