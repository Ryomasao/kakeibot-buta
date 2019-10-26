import Express from 'express'
import * as line from '@line/bot-sdk'

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

function handleEvent(event: any) {
  console.log('token=', event.replyToken)
  if (event.replyToken === '00000000000000000000000000000000') {
    return Promise.resolve(null)
  }

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text,
  })
}

app.get('/api/health', (req, res) => {
  //const data = {
  //  env: process.env.NODE_ENV,
  //  port: process.env.PORT,
  //  config: lineConfig,
  //}
  const data = { message: 'hello' }
  res.send(data)
})

app.listen(process.env.PORT || 8888)
