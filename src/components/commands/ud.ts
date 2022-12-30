import { Composer } from 'telegraf'
import { search } from 'urban-dictionary-client'

const urban = new Composer()

// Urban Dictionary
urban.command('ud', async (ctx) => {
  const query = ctx.message.text.substring(4)
  try {
    search(query)
      .then((res: any) => {
        console.log(res)
        if (res.list) {
          const results = res.list as any[]
          const text = results.map(res => `${res.definition}\n${res.example ?? 'No example found'}`).join('\n\n')
          ctx.replyWithHTML(text.slice(0, 2048))
        }
      })
      .catch((err: any) => console.error(err))
  }
  catch (error) {
    console.log(error)
  }
})

export default urban
