import { Composer, Markup } from 'telegraf'

import { getAnime, getAnimes, getCharacter, getCharacters, getIsBirthdayCharacters } from '../../services/getAnime.js'

const anime = new Composer()

interface Anime {
  id: number
  title: {
    romaji: string
    english: string
    native: string
  }
  type: string
  genres: string[]
}

interface AnimeFull extends Anime {
  description: string
  seasonYear: number
  episodes: number
  coverImage: {
    extraLarge: string
    large: string
    medium: string
    color: string
  }
}

interface Character {
  id: number
  name: {
    first: string
    middle: string
    last: string
    full: string
    native: string
    userPreferred: string
  }
  image: {
    large: string
    medium: string
  }
  description: string
  dateOfBirth: {
    year: number
    month: number
    day: number
  }
  age: string
  gender: string
  bloodType: string
  siteUrl: string
}

anime.command('anime', async (ctx) => {
  const search = ctx.message.text.replace(/^\/anime((@\w+)?\s+)?/i, '')
  if (search.length > 2) {
    // buscar en AniList
    const results = await getAnimes(search)
    const media = results.Page?.media as Anime[]
    const total = results.Page?.pageInfo?.total as number ?? 1
    const perPage = results.Page?.pageInfo?.perPage as number ?? 5
    if (media && media.length > 0) {
      const buttons = []
      for (const anime of media)
        buttons.push([Markup.button.callback(anime.title.romaji ?? 'placeholder text', `getAnime${anime.id}`)])

      buttons.push([
        Markup.button.callback('⏭', `AnimPage${2}-${search}`, total / perPage <= 1),
      ])

      console.log(total, perPage, total / perPage > 1)
      const keyboard = Markup.inlineKeyboard(buttons)
      const text = `Resultados para <b>${search}</b>`

      ctx.replyWithHTML(text, keyboard)
    }
    else {
      ctx.replyWithHTML('No se encontraron resultados o hubo un error')
    }
  }
})

anime.action(/AnimPage\d+\-/i, async (ctx) => {
  if ('data' in ctx.callbackQuery) {
    const pageString = ctx.callbackQuery.data.match(/AnimPage(\d+)/i)?.[1]
    // console.log(ctx.callbackQuery.data?.match(/AnimPage(\d+)/i))
    const page = parseInt(pageString ?? '1')
    console.log('pagina actual ', page)
    const search = ctx.callbackQuery.data?.replace(/AnimPage\d+\-/i, '')
    if (search && search.length > 2) {
      // buscar en AniList
      const results = await getAnimes(search, page)
      const media = results.Page?.media as Anime[]
      const total = results.Page?.pageInfo?.total as number ?? 1
      const perPage = results.Page?.pageInfo?.perPage as number ?? 5
      if (media && media.length > 0) {
        const buttons = []
        for (const anime of media)
          buttons.push([Markup.button.callback(anime.title.romaji ?? 'placeholder text', `getAnime${anime.id}`)])

        const showPrevBtn = page >= 2
        const showNextBtn = total / perPage > page

        const lastRow = []
        showPrevBtn && lastRow.push(Markup.button.callback('⏮', `AnimPage${page - 1}-${search}`))
        showNextBtn && lastRow.push(Markup.button.callback('⏭', `AnimPage${page + 1}-${search}`))

        buttons.push(lastRow)

        ctx.editMessageReplyMarkup({
          inline_keyboard: buttons,
        })
      }
    }
  }
})

anime.action(/getAnime/, async (ctx) => {
  if ('data' in ctx.callbackQuery) {
    const animeId = parseInt(ctx.callbackQuery.data.replace('getAnime', '') ?? '')
    if (!isNaN(animeId)) {
      // buscar en AniList
      const results = await getAnime(animeId)
      const media = results.Media as AnimeFull
      if (media) {
        const caption = `<b>${media.title.romaji ?? 'Title'}</b> (${media.id})
        Year: ${media.seasonYear ?? 'n/a'}  Episodes: ${media.episodes ?? 'n/a'}
      
        <i>${media.description.replace(/<br>/g, '') ?? 'description n/a'}`

        const cover = media.coverImage.large

        ctx.replyWithPhoto(cover, {
          parse_mode: 'HTML',
          caption: `${caption.slice(0, 1020)}</i>`,
        })
      }
      else {
        ctx.replyWithHTML('No se encontraron resultados o hubo un error')
      }
    }
  }
})

anime.command('animebd', async (ctx) => {
  const results = await getIsBirthdayCharacters()
  const characters = results.Page?.characters as Character[]

  if (characters && characters.length > 0) {
    const buttons = []
    for (const char of characters)
      buttons.push([Markup.button.callback(char.name.full ?? 'error con el nombre', `getCharacter${char.id}`)])

    const keyboard = Markup.inlineKeyboard(buttons)
    const text = 'Personajes que celebran su cumpleaños hoy\n'

    ctx.replyWithHTML(text, keyboard)
  }
})

anime.command('character', async (ctx) => {
  const search = ctx.message.text.replace(/^\/character((@\w+)?\s+)?/i, '')
  if (search.length > 2) {
    const results = await getCharacters(search)
    const characters = results.Page?.characters as Character[]
    const total = results.Page?.pageInfo?.total as number ?? 1
    const perPage = results.Page?.pageInfo?.perPage as number ?? 5

    if (characters && characters.length > 0) {
      const buttons = []
      for (const char of characters)
        buttons.push([Markup.button.callback(char.name.full ?? 'error con el nombre', `getCharacter${char.id}`)])

      buttons.push([
        Markup.button.callback('⏭', `CharPage${2}-${search}`, total / perPage <= 1),
      ])

      const keyboard = Markup.inlineKeyboard(buttons)
      const text = `Resultados para <i>${search}</i>`

      ctx.replyWithHTML(text, keyboard)
    }
  }
})

anime.action(/CharPage\d+\-/i, async (ctx) => {
  if ('data' in ctx.callbackQuery) {
    const pageString = ctx.callbackQuery.data.match(/CharPage(\d+)/i)?.[1]
    const page = parseInt(pageString ?? '1')
    console.log('editando el mensaje', page)
    const search = ctx.callbackQuery.data?.replace(/CharPage\d+\-/i, '')
    if (search && search.length > 2) {
      const results = await getCharacters(search, page)
      const characters = results.Page?.characters as Character[]
      const total = results.Page?.pageInfo?.total as number ?? 1
      const perPage = results.Page?.pageInfo?.perPage as number ?? 5

      if (characters && characters.length > 0) {
        const buttons = []
        for (const char of characters)
          buttons.push([Markup.button.callback(char.name.full ?? 'error con el nombre', `getCharacter${char.id}`)])

        const showPrevBtn = page >= 2
        const showNextBtn = total / perPage > page

        const lastRow = []
        showPrevBtn && lastRow.push(Markup.button.callback('⏮', `CharPage${page - 1}-${search}`))
        showNextBtn && lastRow.push(Markup.button.callback('⏭', `CharPage${page + 1}-${search}`))

        buttons.push(lastRow)

        ctx.editMessageReplyMarkup({
          inline_keyboard: buttons,
        })
      }
    }
  }
})

anime.action(/getCharacter/, async (ctx) => {
  if ('data' in ctx.callbackQuery) {
    const characterId = parseInt(ctx.callbackQuery.data.replace('getCharacter', '') ?? '')
    if (!isNaN(characterId)) {
      // buscar en AniList
      const results = await getCharacter(characterId)
      const character = results.Character as Character
      if (character) {
        const caption = `<a href="${character.siteUrl}">${character.name.full ?? 'Nombre'}</a> (${character.id})
        Age: ${character.age ?? 'n/a'}  Gender: ${character.gender ?? 'n/a'}
        
        <i>${character.description.replace(/<br>/g, '') ?? 'description n/a'}`

        const cover = character.image.large

        ctx.replyWithPhoto(cover, {
          parse_mode: 'HTML',
          caption: `${caption.slice(0, 1020)}</i>`,
        })
      }
      else {
        ctx.replyWithHTML('No se encontraron resultados o hubo un error')
      }
    }
  }
})

export default anime
