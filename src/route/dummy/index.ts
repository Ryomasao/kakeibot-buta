import Express from 'express'
import * as line from '@line/bot-sdk'

const router = Express.Router()

const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

// middlewareの箇所に注意する
// line-sdkは、パースされてない素のbodyを扱いたいとのこと
// https://line.github.io/line-bot-sdk-nodejs/guide/webhook.html#build-a-webhook-server-with-express
router.use(Express.json()) // for parsing application/json
router.use(Express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

router.post('/', async (req, res) => {
  const { text } = req.body
  res.send(text)
  //const parsedObj = lineTextParser(text)
  //res.send(parsedObj)

  //if (parsedObj !== null) {
  //  await transact({ ...parsedObj, amount: Number(parsedObj.amount) })
  //}

  //const amount = await aggregate()
  //res.send({ amount })
})

const middleware = (res:any, req:any, next:any) => {
  next()
}

// Herokuとの疎通確認用
router.get('/', middleware,(req, res) => {
  const data = { message: 'hello' }
  res.json(data)
})

export default router
