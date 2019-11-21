import Express from 'express'
import * as line from '@line/bot-sdk'
import { lineTextParser } from '../../services/lineParser'
import { operate } from '../../services/gyoza'
import LineService from '../../services/Line'

const router = Express.Router()

const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

const handleEvent = async (event: any) => {
  const lineService = new LineService(event, lineTextParser)
  const operateObj = lineService.getOperateType()
  if (!operateObj) {
    return null
  }
  const operateResult = await operate(operateObj)
  return lineService.reply(operateResult)
}

router.post('/', line.middleware(lineConfig), async (req, res) => {
  try {
    const results = await Promise.all(req.body.events.map(handleEvent))
    res.json(results)
  } catch (error) {
    console.log(error)
  }
})

export default router
