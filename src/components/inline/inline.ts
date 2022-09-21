import { Composer, Markup } from 'telegraf'

const inline = new Composer()

inline.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query
  const response = [
    {
      title: `Tu porcentaje de ${query}`,
      description: 'La efectividad está probada científicamente',
      message_text: `Soy ${Math.floor(Math.random() * 100)}% ${query}`,
    },
    {
      title: `Probabilidad de que ${query}`,
      description: 'La efectividad está probada científicamente',
      message_text: `La probabilidad de que ${query} es de un ${Math.floor(
        Math.random() * 100,
      )}%`,
    },
  ]
  const markup = Markup.inlineKeyboard([
    [
      Markup.button.switchToCurrentChat(
        'Probar otra vez',
        'fanático de este bot',
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
  // FIXME:
  return await ctx
    .answerInlineQuery(recipes as any, { cache_time: 5, is_personal: true })
    .catch(e => console.log('ERROR WITH INLINE QUERY\n', e))
})

inline.on('chosen_inline_result', ({ chosenInlineResult }) => {
  console.log('Chosen inline result:\n', chosenInlineResult)
})

export default inline
