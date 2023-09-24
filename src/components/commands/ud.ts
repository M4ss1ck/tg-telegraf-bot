import { Composer, Markup } from 'telegraf'
import { search } from 'urban-dictionary-client'
import type { MyContext } from '../../interfaces'
import { prisma } from '../db/prisma.js'
import { saveResultsInDB } from '../global/data.js'

const urban = new Composer<MyContext>()

const escape = (s: string) => s.replace(/\[|\]|<|>/g, '')

// Urban Dictionary
urban.command('ud', async (ctx) => {
  const query = ctx.message.text.substring(4)
  try {
    let results = await prisma.dictionary.findUnique({
      where: {
        query
      }
    }).then(dict => dict ? JSON.parse(dict.response) : []).catch(e => {
      console.log(e)
      return []
    })
    if (!results || results.length === 0) {
      results = await search(query).then(async (res: any) => {
        await saveResultsInDB(res.list, query)
        return res.list
      }).catch((e: any) => {
        console.log(e)
        return []
      })
    }
    // const results = res.list as any[]
    const lastPage = results.length - 1 || 1
    // save results in local db
    // await saveResultsInDB(results, query)
    const current = results[0]
    let text = `<b>${ctx.t('Results for')} <i>"${query}"</i>:</b>`
    let displayFullDefinition = true
    let displayFullExamples = true
    if (text.length + current.definition.length > 2035) {
      displayFullDefinition = false
      displayFullExamples = false
    } else if (text.length + current.definition.length + current.example.length > 2035) {
      displayFullExamples = false
    }

    text += `\n\n${displayFullDefinition ? escape(current.definition) : escape(current.definition).substring(0, 2035 - text.length)}\n<i>${displayFullDefinition && displayFullExamples ? escape(current.example ? current.example : 'No example found').substring(0, 2035 - current.definition.length - text.length) : ""}</i>`

    const buttons = [
      Markup.button.callback('<<', 'ud_na'),
      Markup.button.callback('<', 'ud_na'),
      Markup.button.callback(`1/${lastPage + 1}`, 'ud_na'),
      Markup.button.callback('>', `ud_1_${query.substring(0, 59)}`),
      Markup.button.callback('>>', `ud_${lastPage}_${query.substring(0, 58)}`),
    ]
    const keyboard = Markup.inlineKeyboard(buttons)
    ctx.replyWithHTML(text, keyboard).catch(console.error)
  }
  // })
  // .catch(() => ctx
  //   .replyWithHTML(ctx.t('<b>Error with request!</b> Please try again.'))
  //   .catch((err: any) => console.error(err)))
  // }
  catch (error) {
    console.log(error)
  }
})

urban.action('ud_na', async ctx => {
  if ('data' in ctx.callbackQuery) {
    try {
      ctx.answerCbQuery(ctx.t('This action is not available') as string)
    } catch (error) {
      console.log(error)
    }
  }
})

urban.action(/^ud_(\d+)_(.+)/i, async ctx => {
  if ('data' in ctx.callbackQuery) {
    const [, pageString, query] = ctx.callbackQuery.data.match(/ud_(\d+)_(.+)/i) || [null, '1', '']
    const page = parseInt(pageString ?? '1')
    if (typeof page === 'number' && query) {
      let results = await prisma.dictionary.findUnique({
        where: {
          query
        }
      }).then(dict => dict ? JSON.parse(dict.response) : []).catch(e => {
        console.log(e)
        return []
      })
      if (!results || results.length === 0) {
        results = await search(query).then(async (res: any) => {
          await saveResultsInDB(res.list, query)
          return res.list
        }).catch((e: any) => {
          console.log(e)
          return []
        })
      }
      if (results && results[page]) {
        const current = results[page]
        const lastPage = results.length - 1 || 1
        let text = `<b>${ctx.t('Results for')} <i>"${query}"</i>:</b>`
        let displayFullDefinition = true
        let displayFullExamples = true
        if (text.length + current.definition.length > 2035) {
          displayFullDefinition = false
          displayFullExamples = false
        } else if (text.length + current.definition.length + current.example.length > 2035) {
          displayFullExamples = false
        }

        text += `\n\n${displayFullDefinition ? escape(current.definition) : escape(current.definition).substring(0, 2035 - text.length)}\n<i>${displayFullDefinition && displayFullExamples ? escape(current.example ? current.example : 'No example found').substring(0, 2035 - current.definition.length - text.length) : ""}</i>`

        const buttons = [
          Markup.button.callback('<<', page < 1 ? 'ud_na' : `ud_0_${query.substring(0, 59)}`),
          Markup.button.callback('<', page < 1 ? 'ud_na' : `ud_${page - 1}_${query.substring(0, 58)}`),
          Markup.button.callback(`${page + 1}/${lastPage + 1}`, 'ud_na'),
          Markup.button.callback('>', lastPage > page ? `ud_${page + 1}_${query.substring(0, 59)}` : 'ud_na'),
          Markup.button.callback('>>', lastPage > page ? `ud_${lastPage}_${query.substring(0, 58)}` : 'ud_na'),
        ]
        const keyboard = Markup.inlineKeyboard(buttons)

        ctx.editMessageText(text, { ...keyboard, parse_mode: 'HTML' })
      }
    }
  }
})

export default urban
