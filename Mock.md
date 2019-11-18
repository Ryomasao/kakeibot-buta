# 前提

## 前提

```javascript
import getName, { getAge } from "./service";

// 関数の場合
export default (id: string) => {
  const { name } = getName(id);
  const { age } = getAge(id);
  return { name, age };
};

// クラスの場合
export const verClass = (id: string) => {
  const member = new Member(id);
  const { name } = member.getName();
  const { age } = member.getAge();
  return { name, age };
};
```

```javascript
const getName = (id: string) => {
  return { name: `${id}_tarou` };
};

export default getName;

export const getAge = (id: string) => {
  return { age: `${id}_21` };
};

export class Member {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
  getName() {
    return { name: `${this.id}_tarou` };
  }
  getAge() {
    return { age: `${this.id}_21` };
  }
}
```

### 基本のテスト

```javascript
import target from "../../target";

it("targetにtarouを設定して実行すると{result: 'tarou'}}が返却されること", () => {
  // 関数ver
  expect(target("01")).toEqual({ name: "01_tarou", age: "01_21" });
  // クラスver
  expect(verClass("01")).toEqual({ name: "01_tarou", age: "01_21" });
});
```

### 最初のモック

```javascript
import target from "../../target";

// serviceをモックする
jest.mock("../../service");

it("省略");
```

`jest.mock`でモックしたいモジュールを指定する。ここでは、パスは、`sample.test.ts`からの相対パスを指定している。

`jest.mock`の第 2 引数にモックしたモジュールの実装を書くことができる。
何も書かないと、`undefined`を返す関数が設定される。

イメージとしてはモックされた`service.ts`はこんな感じのコードに置き換えられる。

```javascript
const getName = () => {};
export const getAge = () => {};
export const Member = () => {};
export default getName;
```

この状態でテストを実行すると、テストが失敗することが確認できる。

###　モックの実装を書く

`default export`だけのモックを書くだけであれば、以下のようにシンプルに書ける。

```javascript
jest.mock('../../service', () => {
  return (id:string) => {
    return { name: `${id}_tarou` };
  }
}
```

アロー関数なので`return`すればよりシンプルになるけど、ひとまずそのまま。

上記の状態だと、モックされた`service.ts`は以下のように置き換えられる。

```javascript
// default export だけ置き換わる
const getName = (id: string) => {
  return { name: `${id}_tarou` };
};
export const getAge = () => {};
export const Member = () => {};
export default getName;
```

あんまり使う局面はないかもしれないけど、`default export` だけじゃなくって`named export`もモックする場合は、`__esModule`オプションの設定すれば対応できる。

```javascript
jest.mock('../../service', () => {
  return {
    __esModule:true,
    // defualt export
    default: (id:string) => { return { name:`${id}_tarou` }},
    // named export
    getAge: (id:string) => { return { age: `${id}_21` }},
  }
}
```

上記に加え、named export されている`Member`クラスのモックも追加する。

```javascript
jest.mock('../../service', () => {
  // ES2015より前のクラス構文をちょうど学んだので、こっちで書いてみる
  // 特に意味はない
  const Member = function(this: any, id:string) {
    this.id = id
  }
  Member.prototype = {
    getName: function() {
      return { name: `${this.id}_tarou` }
    },
    getAge: function() {
      return { age: `${this.id}_21` }
    }
  }

  // 通常は、実際の実装と同じようににクラス構文を使えばいい
  //class Member {
  //  id:string
  //  constructor(id:string) {
  //    this.id = id
  //  }
  //  getName() {
  //    return { name: `${this.id}_tarou` }
  //  }
  //  getAge() {
  //    return { age: `${this.id}_21` }
  //  }
  //}

  return {
    __esModule:true,
    default: (id:string) => { return { name:`${id}_tarou` }},
    getAge: (id:string) => { return { age: `${id}_21` }},
    Member
  }
```

### jest.mock のハマりどころ

さきほどまでは、`jest.mock`配下に`Member`クラスの実装を書いていた。

```javascript
jest.mock("../../service", () => {
  // 内容は省略
  class Member {}

  return {
    __esModule: true,
    default: (id: string) => {
      return { name: `${id}_tarou` };
    },
    getAge: (id: string) => {
      return { age: `${id}_21` };
    },
    Member
  };
});
```

`jest.mock`に設定する関数が長くなるので、見通しがわるくるなるので、以下のように`Member`を`jest.mock`の外に出してみる。

```javascript
// 外に出してみた
// 内容は省略
class Member {}

jest.mock("../../service", () => {
  return {
    __esModule: true,
    default: (id: string) => {
      return { name: `${id}_tarou` };
    },
    getAge: (id: string) => {
      return { age: `${id}_21` };
    },
    Member
  };
});
```

この場合エラーになる。
なぜなら`jest.mock`で設定した内容は、jest 実行時にコードの先頭箇所へと hoisting される。
具体的には以下のような実行順序になる。

```javascript
jest.mock("../../service", () => {
  return {
    __esModule: true,
    default: (id: string) => {
      return { name: `${id}_tarou` };
    },
    getAge: (id: string) => {
      return { age: `${id}_21` };
    },
    Member // undefined
  };
});

class Member {}
```

※ function から始まる関数宣言であれば、気にしなくてもよさそうだけど、あんまり使わない方がよいかな。
https://qiita.com/jkr_2255/items/9f9a25987dfaa81472fa

### jest.implement
