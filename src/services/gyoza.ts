import { db } from '../firebase'
import { OpertationType } from './lineParser'

type transaction = {
  type: OpertationType
  amount: number
}

export const transact = async (transaction: transaction) => {
  try {
    const docRef = await db.collection('transactions').add(transaction)
    return docRef
  } catch (e) {
    // TODO エラーハンドリング
    console.error(e)
    throw e
  }
}

export const aggregate = async () => {
  try {
    const querySnapshot = await db.collection('transactions').get()
    const records = querySnapshot.docs.map(doc => doc.data() as transaction)
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
