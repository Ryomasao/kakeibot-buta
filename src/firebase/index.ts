import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const config = {
  apiKey: process.env.FIRE_BASE_API_KEY,
  projectId: process.env.FIRE_BASE_PROJECT_ID,
}

firebase.initializeApp(config)

export const db = firebase.firestore()

export default firebase
