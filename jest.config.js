module.exports = {
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  // Babelではなく、ts-jestを使ったほうがよさげ
  // Babelテストコードの型チェックが機能しないっぽい
  //https://kulshekhar.github.io/ts-jest/user/babel7-or-ts
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
}