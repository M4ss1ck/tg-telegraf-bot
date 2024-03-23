import { Composer, Markup } from 'telegraf'
import type { MyContext } from '../../interfaces'

const inline = new Composer<MyContext>()

inline.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query
  const response = [
    {
      title: ctx.t('Tu porcentaje de {{query}}', { query }),
      description: ctx.t('La efectividad está probada científicamente'),
      message_text: `${ctx.t('Soy')} ${Math.floor(Math.random() * 100)}% ${query}`,
    },
    {
      title: ctx.t('Probabilidad de que {{query}}', { query }),
      description: ctx.t('La efectividad está probada científicamente'),
      message_text: `${ctx.t('La probabilidad de que')} ${query} ${ctx.t('es de un')} ${Math.floor(
        Math.random() * 100,
      )}%`,
    },
  ]
  const markup = Markup.inlineKeyboard([
    [
      Markup.button.switchToCurrentChat(
        ctx.t('Probar otra vez'),
        ctx.t('fanático de este bot'),
      ),
    ],
  ])
  const recipes = response.map(({ title, description, message_text }) => ({
    type: 'article',
    id: title,
    title,
    description,
    // thumb_url: thumbnail,
    input_message_content: {
      message_text,
    },
    ...markup,
  }))
  return await ctx
    .answerInlineQuery(recipes as any, { cache_time: 5, is_personal: true })
    .catch(e => console.log('ERROR WITH INLINE QUERY\n', e))
})

// inline.on('chosen_inline_result', ({ chosenInlineResult }) => {
//   console.log('Chosen inline result:\n', chosenInlineResult)
// })

export default inline
