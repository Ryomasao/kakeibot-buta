import Express from 'express'
import request from 'supertest'
import route from '../route/'
import { Client } from '@line/bot-sdk'
//import * as line from '@line/bot-sdk'


// https://medium.com/@rickhanlonii/understanding-jest-mocks-f0046c68e53c
// https://expressjs.com/ja/guide/writing-middleware.html
// spyOnが一番良さそうなんだけど、以下の方法だと、mockできなかった。 
// なぜだろう。
// const linemock = jest.spyOn(line, 'middleware')
// linemock.mockImplementation((config:any) => {
//   console.log('here')
//   return async (req, res, next) => {
//     console.log('mocked')
//     next()
//   }
// })


const lineMock = (mockObj: {text:string}) => {
        const event = {
          replyToken:'aaa',
          type:'message',
          message: {
            type: 'text',
            text: mockObj.text
          }
        }

  return jest.fn(() => {
    return (req:any, res:any, next:any) => {
        req.body = {
          events:[event]
        }
        next()
    }
  })
}

jest.mock('@line/bot-sdk', () => {
  return {
    middleware: lineMock,
    Client: jest.fn(() => {
      return {
        replyMessage:() => {
          return {
            message: 'hoge'
          }
        }
      }
    })
  }
})

const setup = () => {
  const app = Express()
  app.use(route)
  return app
}

describe("test GET /dummy", () => {
  it('/dummy にGETしたとき、想定したレスポンスが返却されること', async () => {
    const app = setup()
    const res:any = await request(app).get('/dummy')
    expect(res.body).toEqual({message: 'hello'})
  })
})

describe("test POST /bot/webhook", () => {
  it('メッセージに「餃子」を含まない場合、処理対象外になること', async () => {
    const app = setup()
    const message = ''
    const res:any = await request(app).post('/bot/webhook')
    .send({message})
    expect(res.body).toEqual({message: 'hello'})
  })
  it.todo('メッセージに「餃子に」が含まれていて、数値がない場合は処理対象外になること')
  it.todo('メッセージに「餃子に」が含まれていて、数値がある場合')
  it.todo('メッセージに「餃子から」が含まれていて、数値がない場合は処理対象外になること')
  it.todo('メッセージに「餃子から」が含まれていて、数値がある場合')
  it.todo('メッセージに「餃子の中身」が含まれている場合')
})