import target, { verClass } from '../sampleTest/target'
import getName, { getAge, Member as MockedMember } from '../sampleTest/service'

//https://remarkablemark.org/blog/2018/06/28/jest-mock-default-named-export/

class Member {
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

//const Member = function(this: any, id:string) {
//  this.id = id
//}
//Member.prototype = {
//  getName: function() {
//    return { name: `${this.id}_tarou` }
//  },
//  getAge: function() {
//    return { age: `${this.id}_21` }
//  }
//}

jest.mock('../sampleTest/service', () => {
  return {
    __esModule: true,
    default: jest.fn((id: string) => {
      return { name: `${id}_tarou` }
    }),
    getAge: jest.fn((id: string) => {
      return { age: `${id}_21` }
    }),
    // mockImplementationパターン
    Member: jest.fn(),
  }
})

const mockedMember = MockedMember as jest.Mock
mockedMember.mockImplementation((id: string) => {
  return new Member(id)
})

it("targetにtarouを設定して実行すると{result: 'tarou'}}が返却されること", () => {
  expect(target('01')).toEqual({ name: '01_tarou', age: '01_21' })
  expect(getName).toHaveBeenCalledTimes(1)
  expect(getAge).toHaveBeenCalledTimes(1)
  expect(verClass('01')).toEqual({ name: '01_tarou', age: '01_21' })
})
