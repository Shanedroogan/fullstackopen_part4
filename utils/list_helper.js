const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((accumulator, currentValue) => accumulator + currentValue.likes, 0)
}

const favoriteBlog = (blogs) => {
  const getSubset = ({ title, author, likes }) => ({ title, author, likes })
  if (blogs.length === 0) {
    return 'None'
  }

  const favBlogIndex = blogs.reduce((iMax, currentValue, index, arr) => currentValue.likes > arr[iMax].likes ? index : iMax, 0)
  return getSubset(blogs[favBlogIndex])
}

module.exports = {
  dummy, totalLikes, favoriteBlog
}