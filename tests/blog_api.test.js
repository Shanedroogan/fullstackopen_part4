const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))

  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blogs have an id field', async () => {
  const response = await api.get('/api/blogs')


  expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be posted', async () => {
  const newBlog = {
    author: 'Arto Hellas',
    title: 'Keeping it Real',
    url: 'www.lovinlife.edu',
    likes: 12
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain(
    'Keeping it Real'
  )
})

test('blogs\'s likes default to zero if missing', async () => {
  const blogMissingLikes = {
    author: 'Art Deco',
    title: 'An old way of life',
    url: 'www.com'
  }

  const resultBlog = await api
    .post('/api/blogs')
    .send(blogMissingLikes)
    .expect(200)

  expect(resultBlog.body.likes).toBe(0)
})

test('blogs missing title and url receive 400 bad request', async () => {
  const blogMissingTitleandURL = {
    author: 'Shane',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(blogMissingTitleandURL)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toEqual(helper.initialBlogs.length)
})

test('blog can be removed', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  console.log(blogsAtEnd)

  const titles = blogsAtEnd.map(b => b.title)

  expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

  expect(titles).not.toContain(blogToDelete.title)
})

test('blog likes can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogtoUpdate = blogsAtStart[0]

  const blog = {
    title: blogtoUpdate.title,
    author: blogtoUpdate.author,
    url: blogtoUpdate.url,
    likes: 0
  }

  await api
    .put(`/api/blogs/${blogtoUpdate.id}`)
    .send(blog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  expect(blogsAtEnd[0].likes).toBe(0)
  expect(blogsAtEnd[0].title).toBe(blogsAtStart[0].title)
})

afterAll(() => {
  mongoose.connection.close()
})