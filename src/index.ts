import Express from 'express'
import * as line from '@line/bot-sdk'

const app = Express()

const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

app.post('/bot/webhook', line.middleware(lineConfig), (req, res, next) => {
  res.sendStatus(200)
  console.log(process.env.NODE_ENV, lineConfig)
  console.log(req.body)
})

app.get('/api/health', (req, res) => {
  const data = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    config: lineConfig,
  }
  res.send(data)
})

if (process.env.NODE_ENV === 'development') {
  app.listen(8888, 'localhost', () => {
    console.log(process.env.NODE_ENV, lineConfig)
  })
} else {
  app.listen(process.env.PORT)
}
