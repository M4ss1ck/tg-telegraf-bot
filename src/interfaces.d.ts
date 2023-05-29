import type { Context } from 'telegraf'
import type { i18n } from 'i18next'

export interface SessionData {
    lang: string
}
export interface MyContext extends Context {
    session: SessionData
    i18next: i18n
}