// import { extractFromFiles } from "i18n-extract";
import * as fs from 'fs'
import { extractFromFiles, findMissing } from 'i18n-extract'

const keys = extractFromFiles(
  [
    'src/**/*.ts',
  ],
  {
    marker: 'ctx.t',
    parser: 'typescript',
  },
)

const languages = ['es', 'en']

for (const lng of languages) {
  const rawTransData = fs.readFileSync(`locales/${lng}.json`)
  const locales = JSON.parse(rawTransData)

  const missing = findMissing(locales, keys)

  const missingArray = missing.map(m => m.key)

  for (let i = 0; i < missingArray.length; i++) {
    const tKey = missingArray[i]
    locales[tKey] = tKey.replace(/_/g, ' ')
  }

  console.log(
    'Lang:',
    lng,
    '\nKeys amount: ',
    keys.length,
    '\nSaved keys amount: ',
    Object.keys(locales).length,
  )
  console.log('Missing Count: ', missingArray.length)

  fs.writeFileSync(`locales/${lng}.json`, JSON.stringify(locales, null, '    '))
}

