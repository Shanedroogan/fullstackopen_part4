const usersRouter = require('express').Router()
const bcryptjs = require('bcryptjs')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  if(!(body.username && body.password)) {
    return response.status(400).json({
      error: 'username and password required.'
    })
  }

  if(!(body.username.length > 2 && body.password.length > 2)) {
    return response.status(400).json({
      error: 'username and password need to be at least 3 characters long.'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcryptjs.hash(body.password, saltRounds)

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  const savedUser = await newUser.save()

  response.json(savedUser)
})

module.exports = usersRouter