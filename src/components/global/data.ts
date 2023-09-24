import { prisma } from '../db/prisma.js'

import type { User } from '../../global.js'

export const getUsers = async () => {
  const users: User[] = await prisma.usuario.findMany({
    select: {
      tg_id: true,
      rep: true,
      nick: true,
      fecha: true,
      lang: true,
    },
  })
  const userObject: Record<string, User> = users.reduce(
    (prev, curr) => ({ ...prev, [curr.tg_id]: curr }),
    {},
  )
  return userObject
}

export const updateUser = async (user: User) => {
  try {
    await prisma.usuario.upsert({
      where: {
        tg_id: user.tg_id
      },
      update: {
        ...user,
      },
      create: {
        ...user
      }
    })
    global.USUARIOS = await getUsers()
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const saveResultsInDB = async (results: any, query: string) => {
  try {
    const parsedResults = JSON.stringify(results)
    await prisma.dictionary.upsert({
      where: {
        query
      },
      create: {
        query,
        response: parsedResults,
      },
      update: {
        response: parsedResults,
        date: new Date(),
      }
    })
  } catch (error) {
    console.log(error)
  }
}