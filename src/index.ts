import Express from 'express'
import * as line from '@line/bot-sdk'
import { lineTextParser, createMessage } from './services/lineParser'
import { transact, aggregate } from './services/gyoza'

const app = Express()

const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

app.post('/bot/webhook', line.middleware(lineConfig), (req, res, next) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(error => console.log(error))
})

const client = new line.Client(lineConfig)

const handleEvent = (event: any) => {
  // Webhookとの疎通確認の場合のtokenはこれっぽい
  // replyMessageで落ちるので、nullをresolveする
  if (
    event.replyToken === '00000000000000000000000000000000' ||
    event.replyToken === 'ffffffffffffffffffffffffffffffff'
  ) {
    return Promise.resolve(null)
  }

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }

  const parsedObj = lineTextParser(event.message.text)
  if (!parsedObj) {
    return Promise.resolve(null)
  }

  return client.replyMessage(event.replyToken, createMessage(parsedObj))
}

// Herokuとの疎通確認用
app.get('/api/health', (req, res) => {
  //const data = {
  //  env: process.env.NODE_ENV,
  //  port: process.env.PORT,
  //  config: lineConfig,
  //}
  const data = { message: 'hello' }
  res.send(data)
})

// app.useの箇所に注意する
// line-sdkは、パースされてない素のbodyを扱いたいとのこと
// https://line.github.io/line-bot-sdk-nodejs/guide/webhook.html#build-a-webhook-server-with-express
app.use(Express.json()) // for parsing application/json
app.use(Express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/message', async (req, res) => {
  const { text } = req.body
  //const parsedObj = lineTextParser(text)
  //if (parsedObj !== null) {
  //  await transact({ ...parsedObj, amount: Number(parsedObj.amount) })
  //}

  //const amount = await aggregate()
  //res.send({ amount })
})

app.listen(process.env.PORT || 8888)
