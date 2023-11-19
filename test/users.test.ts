import { it, describe, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    const createNewUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: '8T9Kz@example.com',
        password: '123456',
      })
      .expect(201)

    expect(createNewUserResponse.headers['set-cookie']).toBeDefined()

    const cookie = createNewUserResponse.headers['set-cookie'][0]
    expect(cookie).toMatch(/userId/)
  })
})
