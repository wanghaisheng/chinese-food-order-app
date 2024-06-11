type ProfileUpdateData = {
  name?: string
  image?: string
  streetAddress?: string
  postalCode?: string
  city?: string
  country?: string
  phoneNumber?: string
  admin?: boolean
}

export default defineEventHandler(async event => {
  const params = event.context.params

  const body = await readBody<ProfileUpdateData>(event)

  const user = await User.findById({ _id: params?.id }).select('-password')
  let userInfo

  const loggedInUser = event.context.loggedInUser
  if (loggedInUser && loggedInUser.admin) {
    if (user) {
      userInfo = await UserInfo.findOneAndUpdate(
        { email: user?.email },
        {
          $set: {
            streetAddress: body.streetAddress,
            postalCode: body.postalCode,
            city: body.city,
            country: body.country,
            phone: body.phoneNumber,
            admin: body.admin,
          },
        },
        { upsert: true, new: true }
      )
    }

    if (user && userInfo) {
      user.name = body.name || user.name
      user.image = body.image || user.image
      user.admin = body.admin || user.admin

      await user?.save()
      return { user, userInfo }
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bad request',
        message: 'User does not exist',
      })
    }
  } else {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized,not an admin',
    })
  }
})
