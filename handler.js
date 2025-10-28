import { smsg } from './lib/simple.js'
import { format } from 'util'
import * as ws from 'ws'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import failureHandler from './lib/respuestas.js'

const { proto } = (await import('@whiskeysockets/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(() => resolve(), ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (!global.db.data) await global.loadDatabase()

    // Procesamiento del mensaje
    try {
        m = smsg(this, m) || m
        if (!m) return

        // Determinar sender
        let sender = m.isGroup
            ? (m.key.participant || m.sender)
            : m.key.remoteJid

        // Manejo de grupos primarios
        if (m.isGroup) {
            const chat = global.db.data.chats[m.chat]
            if (chat?.primaryBot) {
                const universalWords = ['resetbot', 'resetprimario', 'botreset']
                const firstWord = m.text ? m.text.trim().split(' ')[0].toLowerCase().replace(/^[./#]/, '') : ''
                if (!universalWords.includes(firstWord) && this.user.jid !== chat.primaryBot) return
            }
        }

        // Metadata del grupo
        const groupMetadata = m.isGroup
            ? { ...(this.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(() => ({}))) }
            : {}

        // Inicialización de usuario
        const _user = global.db.data.users[sender] || {}
        global.db.data.users[sender] = {
            exp: isNumber(_user.exp) ? _user.exp : 0,
            coin: isNumber(_user.coin) ? _user.coin : 10,
            bank: isNumber(_user.bank) ? _user.bank : 0,
            joincount: isNumber(_user.joincount) ? _user.joincount : 1,
            diamond: isNumber(_user.diamond) ? _user.diamond : 3,
            emerald: isNumber(_user.emerald) ? _user.emerald : 0,
            iron: isNumber(_user.iron) ? _user.iron : 0,
            gold: isNumber(_user.gold) ? _user.gold : 0,
            coal: isNumber(_user.coal) ? _user.coal : 0,
            stone: isNumber(_user.stone) ? _user.stone : 0,
            candies: isNumber(_user.candies) ? _user.candies : 0,
            gifts: isNumber(_user.gifts) ? _user.gifts : 0,
            lastadventure: isNumber(_user.lastadventure) ? _user.lastadventure : 0,
            lastclaim: isNumber(_user.lastclaim) ? _user.lastclaim : 0,
            health: isNumber(_user.health) ? _user.health : 100,
            crime: isNumber(_user.crime) ? _user.crime : 0,
            lastcofre: isNumber(_user.lastcofre) ? _user.lastcofre : 0,
            lastdiamantes: isNumber(_user.lastdiamantes) ? _user.lastdiamantes : 0,
            lastpago: isNumber(_user.lastpago) ? _user.lastpago : 0,
            lastcode: isNumber(_user.lastcode) ? _user.lastcode : 0,
            lastcodereg: isNumber(_user.lastcodereg) ? _user.lastcodereg : 0,
            lastduel: isNumber(_user.lastduel) ? _user.lastduel : 0,
            lastmining: isNumber(_user.lastmining) ? _user.lastmining : 0,
            muto: 'muto' in _user ? _user.muto : false,
            premium: 'premium' in _user ? _user.premium : false,
            premiumTime: _user.premium ? _user.premiumTime || 0 : 0,
            registered: 'registered' in _user ? _user.registered : false,
            genre: _user.genre || '',
            birth: _user.birth || '',
            marry: _user.marry || '',
            description: _user.description || '',
            packstickers: _user.packstickers || null,
            name: _user.name || m.name,
            age: isNumber(_user.age) ? _user.age : -1,
            regTime: isNumber(_user.regTime) ? _user.regTime : -1,
            afk: isNumber(_user.afk) ? _user.afk : -1,
            afkReason: _user.afkReason || '',
            role: _user.role || 'Nuv',
            banned: 'banned' in _user ? _user.banned : false,
            useDocument: 'useDocument' in _user ? _user.useDocument : false,
            level: isNumber(_user.level) ? _user.level : 0,
            warn: isNumber(_user.warn) ? _user.warn : 0,
            equipment: _user.equipment || { weapon: 'none', armor: 'none', tool: 'none', weapon_durability: 0, armor_durability: 0 },
            inventory: _user.inventory || { health_potion: 0, luck_potion: 0, escape_amulet: 0, lockpick: 0, mysterious_chest: 0 },
            materials: _user.materials || { wood: 0, gem: 0, goblin_skin: 0, orc_bone: 0, slime_goo: 0, wolf_fur: 0, harpy_feather: 0, chitin_shell: 0, lich_phylactery: 0 },
            status: _user.status || { is_jailed: false, jailed_until: 0, is_lucky: false, lucky_until: 0 }
        }

        // Inicialización de chat
        const chat = global.db.data.chats[m.chat] || {}
        global.db.data.chats[m.chat] = {
            ...{
                isBanned: false,
                bannedBots: [],
                sAutoresponder: '',
                welcome: true,
                welcomeText: null,
                byeText: null,
                autolevelup: false,
                autoAceptar: false,
                autoRechazar: false,
                autoresponder: false,
                detect: true,
                audios: false,
                antiBot: false,
                antiBot2: false,
                modoadmin: false,
                antiLink: true,
                antiImg: false,
                reaction: false,
                antiArabe: false,
                nsfw: false,
                antifake: false,
                delete: false,
                botPrimario: null,
                expired: 0
            },
            ...chat
        }

        // Inicialización de settings
        const settings = global.db.data.settings[this.user.jid] || {}
        global.db.data.settings[this.user.jid] = {
            self: false,
            restrict: true,
            jadibotmd: true,
            antiPrivate: false,
            moneda: 'Coins',
            autoread: false,
            status: 0,
            ...settings
        }

    } catch (e) {
        console.error(e)
    }

    // Procesamiento de plugins
    try {
        if (opts['nyimak']) return
        if (!m.fromMe && opts['self']) return
        if (opts['swonly' && m.chat !== 'status@broadcast']) return

        m.text = typeof m.text === 'string' ? m.text : ''

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue

            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try { await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }) } catch (e) { console.error(e) }
            }

            let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix || global.prefix
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p.exec(m.text) : new RegExp(p).exec(m.text), p instanceof RegExp ? p : new RegExp(p)]) :
                    [[new RegExp(_prefix).exec(m.text), new RegExp(_prefix)]]
            ).find(p => p[1])

            if (!match) continue
            let usedPrefix = (match[0] || '')[0]
            let noPrefix = m.text.replace(usedPrefix, '')
            let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
            command = (command || '').toLowerCase()
            args = args || []
            const extra = { match, usedPrefix, noPrefix, args, command, text: args.join` `, conn: this }

            if (typeof plugin.call === 'function') {
                try { await plugin.call(this, m, extra) } catch (e) { m.error = e; console.error(e) }
            }
            break
        }

    } catch (e) {
        console.error(e)
    } finally {
        // Queque y exp
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }
    }
}

// Handler de errores
global.dfail = (type, m, conn) => { failureHandler(type, conn, m) }

// Actualización automática del handler
const file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.green('Actualizando "handler.js"'))
    if (global.conns?.length) {
        const users = [...new Set(global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED))]
        for (const user of users) { user.subreloadHandler(false) }
    }
})
