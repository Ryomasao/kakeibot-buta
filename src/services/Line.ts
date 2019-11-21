import * as line from '@line/bot-sdk'
import { OpretateResult } from './gyoza'
import { OpertationType } from './lineParser'

const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

export default class LineService {
  client: any
  event: any
  messageParser: any

  constructor(event: any, messageParser: any) {
    this.client = new line.Client(lineConfig)
    this.event = event
    this.messageParser = messageParser
  }

  public getOperateType() {
    if (!this.isValidToken()) return null

    if (!this.isValidMessageType()) return null

    return this.messageParser(this.event.message.text)
  }

  public reply(opreationResult: any) {
    return this.client.replyMessage(
      this.event.replyToken,
      this.createMessage(opreationResult),
    )
  }

  private createMessage(op: OpretateResult) {
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

  private isValidToken(): boolean {
    // Webhookとの疎通確認の場合のtokenはこれっぽい
    // replyMessageで落ちるので、nullをresolveする
    if (
      this.event.replyToken === '00000000000000000000000000000000' ||
      this.event.replyToken === 'ffffffffffffffffffffffffffffffff'
    ) {
      return false
    }
    return true
  }

  private isValidMessageType(): boolean {
    if (this.event.type !== 'message' || this.event.message.type !== 'text') {
      return false
    }
    return true
  }
}
