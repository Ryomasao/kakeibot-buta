import Foo from '../../child'
interface MyFoo {
  method: ()=> void;
}



it("test", () => {
  const obj = new Foo();
  const mocked = jest.spyOn<typeof obj, 'hoge'>(obj, 'hoge')
  mocked.mockImplementation(() => {
    console.log('mocked')
    return true
  })
  obj.hoge()
  //expect(child.play()).toBe(true)
})