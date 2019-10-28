import Express from 'express'
import dummy from './dummy'
import bot from './bot'

const router = Express.Router()
router.use('/dummy', dummy)
router.use('/bot/webhook', bot)

export default router
