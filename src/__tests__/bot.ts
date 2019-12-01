import Express from 'express'
import request from 'supertest'
import route from '../route'

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

// https://soumak77.github.io/firebase-mock/tutorials/integration/jest.html
jest.mock('../firebase', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseMock = require('firebase-mock')
  const mockfirestore = new firebaseMock.MockFirestore()
  // flushすることで、firestoreのqueryのPromiseがresolveされるっぽいぞ
  // https://github.com/soumak77/firebase-mock/issues/53
  mockfirestore.autoFlush()
  return {
    // defualt exportをmockする
    __esModule: true,
    default: { firestore: firebaseMock.MockFirestore },
    db: mockfirestore,
    reset: function(this: any) {
      const mockfirestore = new firebaseMock.MockFirestore()
      mockfirestore.autoFlush()
      this.db = mockfirestore
      return
    },
  }
})

jest.mock('@line/bot-sdk', () => {
  return {
    // 以下の関数をjest.mock外に切り出すと、jest実行時にmiddlewareがundefinedになる。
    // というのもjest.mockすると、コードの一番最初に実行されるらしい。(hoisting)
    // なので、ひとまず直接ここに定義する。
    // 関数として切り出して、mockImplementで後から実装を変更する方法でもいけるかも。
    // しかし、その場合TypeScriptの型定義を考慮する必要がある。
    // モックしたオブジェクトにmockImeplmentがあるということを定義する必要がある。
    // https://stackoverflow.com/questions/51495473/typescript-and-jest-avoiding-type-errors-on-mocked-functions

    // Lineのリクエストから各種情報を取得するmiddlewareのモック

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    middleware: (config: any) => {
      return (req: any, res: any, next: any) => {
        const event = {
          replyToken: 'aaa',
          type: 'message',
          message: {
            type: 'text',
            text: req.body.message,
          },
        }

        req.body = {
          events: [event],
        }
        next()
      }
    },
    // BotがLineにレスポンスを返す機能のモック
    Client: jest.fn(() => {
      return {
        replyMessage: (token: any, message: string) => {
          return {
            message: message,
          }
        },
      }
    }),
  }
})

// https://firebase.google.com/docs/firestore/manage-data/delete-data?hl=ja
// fireStoreのデータが各テスト間で残っちゃうので
// mockの設定でどうにかいけないかissue
// https://github.com/soumak77/firebase-mock/issues/119
//const truncateFireStore = async () => {
//  const querySnapshot = await db.collection('transactions').get()
//  if(querySnapshot.size === 0) return
//  let batch = db.batch()
//  querySnapshot.docs.forEach((doc:any) => batch.delete(doc.ref))
//  await batch.commit()
//}
// ↑リセット関数を使うことで対応できた！

const setup = async () => {
  //await truncateFireStore()
  const app = Express()
  // line-sdkではミドルウェア内でbody-parserをしている。
  // テスト時には、line-sdkをモックするので、body-parserを個別に追加しとく。
  // これがないとreq.bodyはundeindeになる。
  app.use(Express.json())
  app.use(route)
  return app
}

// reset関数は、モックした結果作成される関数なので、importだとtypescriptのエラーになってしまう。
// requireを使うことでエラーを回避できる。
// また、以下の参照の仕方だとreset関数のthisのコンテキストがかわってが正しく取得できないので、firebase全体を読み込むことにする
// const reset = require('../firebase').reset ← thisのコンテキストはグローバル？

// const reset = require('../firebase') ← thisのコンテキストはグローバル？
// firebase.reset() ← thisのコンテキストは、firebaseオブジェクト
// eslint-disable-next-line @typescript-eslint/no-var-requires
const firebase = require('../firebase')

beforeEach(() => {
  firebase.reset()
})

describe('test GET /dummy', () => {
  it('/dummy にGETしたとき、想定したレスポンスが返却されること', async () => {
    const app = await setup()
    const res: any = await request(app).get('/dummy')
    expect(res.body).toEqual({ message: 'hello' })
  })
})

describe('test POST /bot/webhook', () => {
  it('メッセージに「餃子」を含まない場合、処理対象外になること', async () => {
    const app = await setup()
    const message = ''
    const res: any = await request(app)
      .post('/bot/webhook')
      .send({ message })
    expect(res.body).toEqual([null])
  })
  it('メッセージに「餃子に」が含まれていて、数値がある場合、数値の内容をfirebaseに保存して、メッセージ「🥟から1000円を入れるけろねえ」を返すこと', async () => {
    const app = await setup()
    const message = '餃子に1000'
    const res: any = await request(app)
      .post('/bot/webhook')
      .send({ message })
    expect(res.body).toEqual([
      {
        message: {
          text: '🥟に1000円を入れるけろねえ',
          type: 'text',
        },
      },
    ])
  })
  it('メッセージに「餃子から」が含まれていて、数値がある場合、数値の内容をfirebaseに保存して、メッセージ「🥟から1000円を出すけろねえ」を返すこと', async () => {
    const app = await setup()
    const message = '餃子から1000'
    const res: any = await request(app)
      .post('/bot/webhook')
      .send({ message })
    expect(res.body).toEqual([
      {
        message: {
          text: '🥟から1000円を出すけろねえ',
          type: 'text',
        },
      },
    ])
  })
  it('メッセージに「餃子に」または「餃子から」が含まれていて、数値がない場合は処理対象外になること', async () => {
    const app = await setup()
    const message = '餃子に'
    const res: any = await request(app)
      .post('/bot/webhook')
      .send({ message })
    expect(res.body).toEqual([null])
  })
  it('メッセージに「餃子の中身」が含まれている場合,firebaseのtransactionsを計算して、メッセージ「🥟の中身はxxxx円けろねえ」を返す', async () => {
    const app = await setup()
    firebase.db.collection('transactions').add({ type: 1, amount: 1000 })
    firebase.db.collection('transactions').add({ type: 2, amount: 2000 })
    const message = '餃子の中身'
    const res: any = await request(app)
      .post('/bot/webhook')
      .send({ message })
    expect(res.body).toEqual([
      {
        message: {
          text: '🥟の中身は-1000円けろねえ',
          type: 'text',
        },
      },
    ])
  })
})
