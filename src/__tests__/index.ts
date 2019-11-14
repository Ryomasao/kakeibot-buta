import Express from 'express'
import request from 'supertest'
import route from '../route/'

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

const event = {
  replyToken:'aaa',
  type:'message',
  message: {
    type: 'text',
    text: 'hello'
  }
}

// https://soumak77.github.io/firebase-mock/tutorials/integration/jest.html
jest.mock('../firebase', () => ({
  db: 'hoge'
}))

jest.mock('@line/bot-sdk', () => {
  return {
    // 以下の関数をjest.mock外に切り出すと、jest実行時にmiddlewareがundefinedになる。
    // scopeがよくわからない。

    // Lineのリクエストから各種情報を取得するmiddlewareのモック
    middleware: (config: any) => {
      return (req:any, res:any, next:any) => {
        req.body = {
          events:[event]
        }
        next()
      }
    },
    // BotがLineにレスポンスを返す機能のモック
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
    expect(res.body).toEqual([null])
  })
  it.todo('メッセージに「餃子に」が含まれていて、数値がない場合は処理対象外になること')
  it.todo('メッセージに「餃子に」が含まれていて、数値がある場合')
  it.todo('メッセージに「餃子から」が含まれていて、数値がない場合は処理対象外になること')
  it.todo('メッセージに「餃子から」が含まれていて、数値がある場合、数値の内容をfirebaseに保存して、メッセージ「」を返すこと')
  it.todo('メッセージに「餃子の中身」が含まれている場合')
})