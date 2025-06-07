import { pgTable, pgEnum, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'canceled',
])

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  amount: integer('amount').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})