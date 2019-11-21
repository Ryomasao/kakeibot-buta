import { toASCII } from '../util/toASCII'

const BOT_KEYWORD = '餃子'

export enum OpertationType {
  deposit = 1,
  withdraw,
  aggregate,
}

type Transaction = {
  type: OpertationType.deposit | OpertationType.withdraw
  amount: number
}

type Inquiry = {
  type: OpertationType.aggregate
}

export type Operation = Transaction | Inquiry

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

// 「餃子」から→withdraw
// 「餃子」に→deposit
// 「餃子」の中身→aggregate
const getOperation = (text: string): OpertationType | null => {
  const begin = text.indexOf(BOT_KEYWORD)
  const operationText = text.slice(
    begin + BOT_KEYWORD.length,
    begin + BOT_KEYWORD.length + 3,
  )

  if (operationText.slice(0, 2) === 'から') return OpertationType.withdraw

  if (operationText[0] === 'に') return OpertationType.deposit

  if (operationText.slice(0, 3) === 'の中身') return OpertationType.aggregate

  return null
}

export const lineTextParser = (text: string): Operation | null => {
  if (!isBotKeyWord(text)) return null

  const operationType = getOperation(text)
  if (!operationType) return null

  if (operationType === OpertationType.aggregate) {
    return { type: OpertationType.aggregate }
  }

  const amountText = getMoneyText(text)
  if (!amountText) return null

  return { type: operationType, amount: Number(amountText) }
}
