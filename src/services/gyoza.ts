import { db } from '../firebase'
import { OpertationType, Operation } from './lineParser'

db.collection('hoge')

type Transaction = {
  type: OpertationType
  amount: number
}

export type OpretateResult = {
  type: OpertationType
  amount: number
}

export const operate = async (op: Operation): Promise<OpretateResult> => {
  let amount = 0
  if (
    op.type === OpertationType.deposit ||
    op.type === OpertationType.withdraw
  ) {
    amount = await transact(op)
  } else {
    amount = await aggregate()
  }

  return { type: op.type, amount }
}

export const transact = async (transaction: Transaction): Promise<number> => {
  try {
    await db.collection('transactions').add(transaction)
    return transaction.amount
  } catch (e) {
    // TODO エラーハンドリング
    console.error(e)
    throw e
  }
}

export const aggregate = async (): Promise<number> => {
  try {
    const querySnapshot = await db.collection('transactions').get()
    const records = querySnapshot.docs.map(doc => doc.data() as Transaction)
    const amount = records.reduce((acc, cur) => {
      return cur.type === OpertationType.deposit
        ? acc + cur.amount
        : acc - cur.amount
    }, 0)

    return amount
  } catch (e) {
    // TODO エラーハンドリング
    console.error(e)
    throw e
  }
}

export const fetchWordList = async () => {
  try {
    const querySnapshot = await db
      .collection('sentences')
      .where('uid', '==', '1xtLm7lVQSck1V2xu97ujQsIPPE3')
      .get()

    // querySnapshot.forEach(doc => {
    //  console.log(doc.data())
    // })

    const records = querySnapshot.docs.map(doc => doc.data())

    return { sentences: records }
  } catch (e) {
    // TODO エラーハンドリング
    console.error(e)
    throw e
  }
}
