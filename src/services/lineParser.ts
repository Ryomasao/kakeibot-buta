import { toASCII } from '../util/toASCII'
import * as line from '@line/bot-sdk'

const BOT_KEYWORD = '餃子'

enum OpertationType {
  deposit = 1,
  withdraw,
}

type ParsedItem = {
  type: OpertationType
  money: string
}

export const lineTextParser = (text: string): ParsedItem | null => {
  if (!isBotKeyWord(text)) return null

  const operationType = getOperation(text)
  if (!operationType) return null

  const moneyText = getMoneyText(text)
  if (!moneyText) return null

  return { type: operationType, money: moneyText }
}

export const createMessage = (obj: ParsedItem): line.TextMessage => {
  const text =
    obj.type === OpertationType.deposit
      ? `餃子に${obj.money}を入れるけろねえ`
      : `餃子から${obj.money}を出すけろねえ`

  return {
    type: 'text',
    text,
  }
}

const isBotKeyWord = (text: string): boolean => {
  const regex = new RegExp(BOT_KEYWORD, 'i')
  return regex.test(text)
}

// 文字列から最初の連続する数値を抜き出して返す。
// 全角であれば半角にする。
const getMoneyText = (text: string): string | null => {
  const results = text.match(/[0-9０-９]+/)
  if (results === null) return null
  return toASCII(results[0])
}

const getOperation = (text: string): OpertationType | null => {
  const begin = text.indexOf(BOT_KEYWORD)
  const operationText = text.slice(
    begin + BOT_KEYWORD.length,
    begin + BOT_KEYWORD.length + 2
  )

  if (operationText === 'から') return OpertationType.withdraw

  if (operationText[0] === 'に') return OpertationType.deposit

  return null
}
