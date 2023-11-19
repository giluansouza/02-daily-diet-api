import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  // Busca todas as refeições
  app.get('/', async (request) => {
    const { userId } = request.cookies

    const meals = await knex('meals')
      .where('userId', userId)
      .orderBy('meal_at', 'desc')
      .select('*')

    return {
      meals,
    }
  })

  // Busca uma refeição
  app.get('/:id', async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const { userId } = request.cookies

    const meals = await knex('meals')
      .where({
        id,
        userId,
      })
      .first()

    return {
      meals,
    }
  })

  // Cria uma refeição
  app.post('/', async (request, reply) => {
    const { userId } = request.cookies
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      diet: z.boolean(),
      mealAt: z.string(),
    })

    const { name, description, diet, mealAt } = createMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      diet,
      userId,
      meal_at: mealAt,
    })

    return reply.status(201).send()
  })

  // Atualiza uma refeição
  app.put('/:id', async (request, reply) => {
    const { userId } = request.cookies

    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      diet: z.boolean(),
      mealAt: z.string(),
    })

    const { name, description, diet, mealAt } = updateMealBodySchema.parse(
      request.body,
    )

    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    await knex('meals')
      .where({
        id,
        userId,
      })
      .update({
        name,
        description,
        diet,
        meal_at: mealAt,
      })

    return reply.status(200).send()
  })

  // Deleta uma refeição
  app.delete('/:id', async (request, reply) => {
    const { userId } = request.cookies
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    await knex('meals').where({ id, userId }).delete()

    return reply.status(200).send()
  })

  // Busca o resumo das refeições
  app.get('/summary', async (request) => {
    const { userId } = request.cookies

    const mealsTotal = await knex('meals')
      .where('userId', userId)
      .count('diet', { as: 'total' })
      .then((meals) => {
        return Number(meals[0].total)
      })

    const mealsDiet = await knex('meals')
      .where({
        userId,
        diet: true,
      })
      .count('diet', { as: 'total' })
      .then((meals) => {
        return Number(meals[0].total)
      })

    const mealsDietFalse = await knex('meals')
      .where({
        userId,
        diet: false,
      })
      .count('diet', { as: 'total' })
      .then((meals) => {
        return Number(meals[0].total)
      })

    const bestDietSequence = await knex('meals')
      .where('userId', userId)
      .orderBy('meal_at', 'desc')
      .select('meal_at', 'diet', 'userId')
      .then((meals) => {
        let bestDietSequence = 0
        let currentBestDietSequence = 0

        meals.forEach((meal) => {
          if (meal.diet) {
            currentBestDietSequence++
            if (currentBestDietSequence > bestDietSequence) {
              bestDietSequence = currentBestDietSequence
            }
          } else {
            if (currentBestDietSequence > bestDietSequence) {
              bestDietSequence = currentBestDietSequence
            }
            currentBestDietSequence = 0
          }
        })

        return bestDietSequence
      })

    return {
      mealsTotal,
      mealsDiet,
      mealsDietFalse,
      bestDietSequence,
    }
  })
}
