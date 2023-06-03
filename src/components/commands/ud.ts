import { Composer } from 'telegraf'
import { search } from 'urban-dictionary-client'
import type { MyContext } from '../../interfaces'

const urban = new Composer<MyContext>()

const escape = (s: string) => s.replace(/\[|\]|<|>/g, '')

// Urban Dictionary
urban.command('ud', async (ctx) => {
  const query = ctx.message.text.substring(4)
  try {
    search(query)
      .then((res: any) => {
        if (res.list) {
          const results = res.list as any[]
          let text = `<b>${ctx.t('Results for')} <i>"${query}"</i>:</b>`
          for (let i = 0; i < results.length; i++) {
            const res = results[i]
            if (text.length + res.definition.length + res.example.length > 2035)
              break

            text += `\n\n${escape(res.definition)}\n<i>${res.example ? escape(res.example) : 'No example found'}</i>`
          }
          ctx.replyWithHTML(text).catch((err: any) => console.error(err))
        }
      })
      .catch(() => ctx
        .replyWithHTML(ctx.t('<b>Error with request!</b> Please try again.'))
        .catch((err: any) => console.error(err)))
  }
  catch (error) {
    console.log(error)
  }
})

export default urban
