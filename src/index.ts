import Express from 'express'
import route from './route'

const app = Express()
app.use(route)
app.listen(process.env.PORT || 8888)
