import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })
    const id = randomUUID()
    const { name, email, password } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id,
      name,
      email,
      password,
    })

    let userId = request.cookies.userId

    if (!userId) {
      userId = id
      reply.cookie('userId', userId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users').select('*')

    return {
      users,
    }
  })
}
