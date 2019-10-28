import Express from 'express'
import * as line from '@line/bot-sdk'
import { lineTextParser, createMessage } from '../../services/lineParser'
import { operate } from '../../services/gyoza'

const router = Express.Router()

const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

router.post('/', line.middleware(lineConfig), (req, res, next) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(error => console.log(error))
})

const client = new line.Client(lineConfig)

const handleEvent = async (event: any) => {
  // Webhookとの疎通確認の場合のtokenはこれっぽい
  // replyMessageで落ちるので、nullをresolveする
  if (
    event.replyToken === '00000000000000000000000000000000' ||
    event.replyToken === 'ffffffffffffffffffffffffffffffff'
  ) {
    return null
  }

  if (event.type !== 'message' || event.message.type !== 'text') {
    return null
  }

  const parsedObj = lineTextParser(event.message.text)
  if (!parsedObj) {
    return null
  }

  const operateResult = await operate(parsedObj)

  return client.replyMessage(event.replyToken, createMessage(operateResult))
}


export default router
