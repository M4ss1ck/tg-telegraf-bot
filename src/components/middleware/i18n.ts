import { Composer } from 'telegraf'
import type { MyContext } from '../../interfaces.js'
import { i18n as i18next } from '../../locales/i18n.js'

const i18n = new Composer<MyContext>()

i18n.use(async (ctx, next) => {
  if (
    ctx.from?.id
  ) {
    const userLocale = ctx.session?.lang ?? ctx.from.language_code
    const _i18next = i18next.cloneInstance({ initImmediate: false, lng: userLocale })
    ctx.session = { lang: userLocale }
    _i18next.on('languageChanged', (lng) => {
      ctx.session.lang = lng
    })
    ctx.i18next = _i18next
    ctx.t = _i18next.t
  }
  return next()
})

i18n.command(['changeLanguage', 'cl'], async (ctx) => {
  const language = ctx.session.lang === 'en' ? 'es' : 'en'
  ctx.i18next.changeLanguage(language)
  return ctx.reply(ctx.i18next.t('changeLanguage') as string)
})

i18n.action('changeLanguage', async (ctx) => {
  const language = ctx.session.lang === 'en' ? 'es' : 'en'
  ctx.i18next.changeLanguage(language)
  return ctx.answerCbQuery(ctx.i18next.t('changeLanguage') as string)
})

export default i18n
