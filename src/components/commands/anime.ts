import { Composer, Markup } from 'telegraf'

import { getAnime, getAnimes } from '../../services/getAnime.js'

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

anime.command('anime', async (ctx) => {
  const search = ctx.message.text.replace(/^\/anime(@\w+)?\s+/i, '')
  if (search.length > 2) {
    // buscar en AniList
    const results = await getAnimes(search)
    const media = results.Page?.media as Anime[]
    if (media && media.length > 0) {
      const buttons = []
      for (const anime of media) {
        console.log(anime)
        buttons.push([Markup.button.callback(anime.title.romaji ?? 'placeholder text', `getAnime${anime.id}`)])
      }
      const keyboard = Markup.inlineKeyboard(buttons)
      const text = `resultados para <b>${search}</b>`

      ctx.replyWithHTML(text, keyboard)
    }
    else {
      ctx.replyWithHTML('No se encontraron resultados o hubo un error')
    }
  }
})

anime.action(/getAnime/, async (ctx) => {
  const animeId = parseInt(ctx.callbackQuery.data?.replace('getAnime', '') ?? '')
  if (!isNaN(animeId)) {
    // buscar en AniList
    const results = await getAnime(animeId)
    // console.log(results)
    const media = results.Media as AnimeFull
    if (media) {
      const caption = `<b>${media.title.romaji ?? 'Title'}</b> (${media.id})
      Year: ${media.seasonYear ?? 'n/a'}  Episodes: ${media.episodes ?? 'n/a'}
      
      <i>${media.description.replace(/<br>/g, '') ?? 'description n/a'}</i>`

      const cover = media.coverImage.large

      ctx.replyWithPhoto(cover, {
        parse_mode: 'HTML',
        caption,
      })
    }
    else {
      ctx.replyWithHTML('No se encontraron resultados o hubo un error')
    }
  }
})

export default anime
