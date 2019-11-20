import getName, { getAge, Member } from './service'

// 関数の場合
export default (id: string) => {
  const { name } = getName(id)
  const { age } = getAge(id)
  return { name, age }
}

// クラスの場合
export const verClass = (id: string) => {
  const member = new Member(id)
  const { name } = member.getName()
  const { age } = member.getAge()
  return { name, age }
}
