import { fileURLToPath } from 'url'
import path from 'path'
import i18next from 'i18next'
import backend from 'i18next-fs-backend'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

await i18next.use(backend).init({
  debug: true,
  initImmediate: false,
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['es', 'en'],
  backend: {
    loadPath: path.join(__dirname, '../../locales/{{lng}}.json'),
  },
})

export const i18n = i18next
