import { Composer } from 'telegraf'
import type { MyContext } from '../../interfaces.js'
import { i18n as i18next } from '../../locales/i18n.js'
import { updateUser } from '../global/data.js'

const i18n = new Composer<MyContext>()

i18n.use(async (ctx, next) => {
  try {
    if (
      ctx.from?.id
    ) {
      const userObjFromGlobal = global.USUARIOS[ctx.from.id.toString()]
      const userLocale = userObjFromGlobal?.lang ?? ctx.session?.lang ?? ctx.from.language_code
      const _i18next = i18next.cloneInstance({ initImmediate: false, lng: userLocale })
      ctx.session = { lang: userLocale }
      _i18next.on('languageChanged', async (lng) => {
        ctx.session.lang = lng
        await updateUser({ ...userObjFromGlobal, lang: lng })
      })
      ctx.i18next = _i18next
      ctx.t = _i18next.t
    }
  } catch (error) {
    console.log('Error in i18n middleware')
    console.log(error)
  }
  return next()
})

i18n.command(['changeLanguage', 'cl'], async (ctx) => {
  const language = ctx.session.lang === 'en' ? 'es' : 'en'
  ctx.i18next.changeLanguage(language)
  return ctx.reply(ctx.t('changeLanguage') as string)
})

i18n.action('changeLanguage', async (ctx) => {
  const language = ctx.session.lang === 'en' ? 'es' : 'en'
  ctx.i18next.changeLanguage(language)
  return ctx.answerCbQuery(ctx.t('changeLanguage') as string)
})

export default i18n
