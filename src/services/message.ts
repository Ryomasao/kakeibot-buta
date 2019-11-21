import { OpertationType } from './lineParser'
import { OpretateResult } from './gyoza'
import * as line from '@line/bot-sdk'

export const createMessage = (op: OpretateResult): line.TextMessage => {
  let text = ''

  if (
    op.type === OpertationType.deposit ||
    op.type === OpertationType.withdraw
  ) {
    text =
      op.type === OpertationType.deposit
        ? `🥟に${op.amount}円を入れるけろねえ`
        : `🥟から${op.amount}円を出すけろねえ`
  } else {
    text = `🥟の中身は${op.amount}円けろねえ`
  }

  return {
    type: 'text',
    text,
  }
}
