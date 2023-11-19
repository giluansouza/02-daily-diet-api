import { it, describe, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createNewUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: '8T9Kz@example.com',
        password: '123456',
      })

    const userId = createNewUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Coxinha',
        description: 'Coxinha de frango',
        diet: true,
        userId,
        mealAt: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all meals', async () => {
    const createNewUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: '8T9Kz@example.com',
        password: '123456',
      })
      .expect(201)

    const cookieString = createNewUserResponse.get('Set-Cookie')
    const cookieParts = cookieString[0].split(';')
    const userIdCookie = cookieParts.find((part) =>
      part.trim().startsWith('userId='),
    )

    // Extrair apenas o valor do userId do elemento encontrado
    let userId = null
    if (userIdCookie) {
      const userIdKeyValue = userIdCookie.split('=') // Dividir a string por '='
      userId = userIdKeyValue[1] // O valor do userId estará no índice 1 do array
    }

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Coxinha',
        description: 'Coxinha de frango',
        diet: true,
        userId,
        mealAt: new Date(),
      })
      .expect(201)

    await request(app.server)
      .get('/meals')
      .set('Cookie', cookieString)
      .expect(200)

    // expect(listMealsResponse.body.meals).toEqual([
    //   expect.objectContaining({
    //     name: 'Coxinha',
    //     description: 'Coxinha de frango',
    //     diet: true,
    //     userId,
    //     mealAt: new Date(),
    //   }),
    // ])
  })

  it('should be able to get a meal', async () => {
    const createNewUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: '8T9Kz@example.com',
        password: '123456',
      })

      const cookieString = createNewUserResponse.get('Set-Cookie')
      const cookieParts = cookieString[0].split(';')
      const userIdCookie = cookieParts.find((part) =>
        part.trim().startsWith('userId='),
      )
  
      // Extrair apenas o valor do userId do elemento encontrado
      let userId = null
      if (userIdCookie) {
        const userIdKeyValue = userIdCookie.split('=') // Dividir a string por '='
        userId = userIdKeyValue[1] // O valor do userId estará no índice 1 do array
      }

    await request(app.server).post('/meals').send({
      name: 'Coxinha',
      description: 'Coxinha de frango',
      diet: true,
      userId,
      mealAt: new Date(),
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookieString)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookieString)
      .expect('Content-Type', /json/)
      .expect(200)
  })
})
