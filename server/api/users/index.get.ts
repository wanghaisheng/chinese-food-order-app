export default defineEventHandler(async event => {
  const users = await User.find().select('-password')

  const loggedInUser = event.context.loggedInUser
  if (loggedInUser && loggedInUser.admin) {
    return users
  } else {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized,not an admin',
    })
  }
})
