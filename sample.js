function Mock() {
  this.firestore = this
}

Mock.prototype.hoge = function (delay) {
  console.log('hoge')
  return this
}

Mock.prototype.fuga = function (delay) {
  console.log('hoge')
  return this
}

module.exports = Mock;