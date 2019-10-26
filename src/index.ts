import Express from 'express'
import * as line from '@line/bot-sdk'

const app = Express()

const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

app.post('/bot/webhook', line.middleware(lineConfig), (req, res, next) => {
  res.sendStatus(200)
  console.log(req.body)
})

const port = process.env.NODE_ENV === 'development' ? 8888 : 0
const host = process.env.NODE_ENV === 'development' ? 'localhost' : ''

app.listen(port, host, () => {
  console.log(process.env.NODE_ENV, lineConfig)
})
