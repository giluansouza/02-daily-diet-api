import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(usersRoutes, {
  prefix: 'users',
})

app.get('/', async () => {
  return { message: 'API Rest Daily Diet' }
})

// Rota genérica para lidar com rotas inexistentes
app.setNotFoundHandler((request, reply) => {
  reply.code(404).send({ mensagem: 'Rota não encontrada' })
})
