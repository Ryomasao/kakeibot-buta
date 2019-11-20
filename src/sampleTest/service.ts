const getName = (id: string) => {
  return { name: `${id}_tarou` }
}

export const getAge = (id: string) => {
  return { age: `${id}_21` }
}

export class Member {
  id: string
  constructor(id: string) {
    this.id = id
  }
  getName() {
    return { name: `${this.id}_tarou` }
  }
  getAge() {
    return { age: `${this.id}_21` }
  }
}

export default getName
