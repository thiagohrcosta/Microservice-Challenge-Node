import { orders } from "./chanels/order.ts";

orders.consume('orders', async message => {
  if(!message) {
    return null
  }

  console.log(message?.content.toString())

  orders.ack(message)
}, {
  noAck: false,
})