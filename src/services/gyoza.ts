import firebase, { db } from '../firebase'
import { OpertationType, Operation } from './lineParser'

type Transaction = {
  type: OpertationType
  amount: number
}

type TransactionRecored = Transaction & {
  // firestoreのtimestamp型
  // toDate()でjsのDate型に変換できる
  timestamp: firebase.firestore.Timestamp
}

export type OpretateResult = {
  type: OpertationType
  amount: number
}

export const transact = async (transaction: Transaction): Promise<number> => {
  try {
    await db.collection('transactions').add({
      ...transaction,
      // 取引データ保存時に、timestampを保持するように設定する
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
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
    const records = querySnapshot.docs.map(
      doc => doc.data() as TransactionRecored,
    )

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
