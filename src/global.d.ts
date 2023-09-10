declare global {
    var USUARIOS: Record<string, User>
}

export interface User {
    tg_id: string
    rep: number
    nick: string
    fecha: Date
    lang: String
}

export { };