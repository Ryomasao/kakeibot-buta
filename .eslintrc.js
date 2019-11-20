module.exports = {
  parser: "@typescript-eslint/parser", // typescirptを解釈できるようにパーサーを変更する
  extends: [
    "plugin:@typescript-eslint/recommended", // tsの推奨ルール
    'plugin:prettier/recommended', //  eslint-plugin-prettier and eslint-config-prettierを有効にする. 一番最後に書く。
  ],
  parserOptions: {
    ecmaVersion: 2019, // パース対象のECMAScriptのバージョン
    sourceType: "module" // ESCMAScriptならmodule一択。defaultのscriptって一体
  },
  rules: {
    // 個別ルールがあれば書く

    // anyの指定は許容する
    "@typescript-eslint/no-explicit-any": "off",
    // functuionの返り値の型指定は任意
    "@typescript-eslint/explicit-function-return-type": "off",

    // interfaceとtypeのルール
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
          multiline: {
              delimiter: 'none',
              requireLast: true,
          },
          singleline: {
              delimiter: 'comma',
              requireLast: false,
          },
      },
  ],
  }
};