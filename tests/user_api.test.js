const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const bcryptjs = require('bcryptjs')

const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcryptjs.hash('secret', 10)
    const user = new User({ username: 'root', name: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const user = {
      username: 'Shane',
      name: 'Shane',
      password: 'secretsecret'
    }

    await api.post('/api/users')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    const usernames = usersAtEnd.map(u => u.username)

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    expect(usernames).toContain(user.username)
  })

  test('user missing password is not created', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalidUser = {
      username: 'Shane',
      name: 'Shane'
    }

    const response = await api.post('/api/users')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBe('username and password required.')

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = usersAtEnd.map(u => u.username)

    expect(usernames).not.toContain(invalidUser.username)
  })

  test('user missing username is not created', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalidUser = {
      name: 'Shane',
      password: 'secret'
    }

    const response = await api.post('/api/users')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBe('username and password required.')

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = usersAtEnd.map(u => u.username)

    expect(usernames).not.toContain(invalidUser.username)
  })

  test('user with username too short is not added', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalidUser = {
      username: 'S',
      name: 'Shane',
      password: 'serecreertg'
    }

    const response = await api.post('/api/users')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBe('username and password need to be at least 3 characters long.')

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = usersAtEnd.map(u => u.username)

    expect(usernames).not.toContain(invalidUser.username)
  })

  test('user with too short password is not added', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalidUser = {
      username: 'Shane',
      name: 'Shane',
      password: 'se'
    }

    const response = await api.post('/api/users')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBe('username and password need to be at least 3 characters long.')

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = usersAtEnd.map(u => u.username)

    expect(usernames).not.toContain(invalidUser.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
})