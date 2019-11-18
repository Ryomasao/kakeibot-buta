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

### mockfn.mockImplementation で回避する

ここまでは、`jest.mock`にモックするモジュールの実装を直接書いてきたが、モック関数を使うとより便利になる。  
モック関数は`jest.fn`で作成できて、そのモックがどんな引数で呼ばれたのか？何回呼ばれたの？とかをアサートすることができる。

ここでは、モック関数の実装を書くことができる`mockImplementation`を使うことで、`jest.mock`では hosting されることでできなかったことを対応してみる。

```javascript
// 2:ここで読み込むserviceモジュールは、既にモックが適用されている状態になる
// つまり、MockedMember = jest.fn()
import { Member as MockedMember}  from '../../service'

// モックするMemberの実装
class Member {}

// 1:serviceのモックの設定
jest.mock("../../service", () => {
  return {
    __esModule: true,
    default: (id: string) => {
      return { name: `${id}_tarou` };
    },
    getAge: (id: string) => {
      return { age: `${id}_21` };
    },
    // Memberにはクラスではなくモック関数をセットしておく。
    Member: jest.fn()
  };
});

// 3: Typescriptをつかっている場合、モック状態のクラスにモック関数のメソッドがあることを教えてあげるのでキャストする必要がある
// jest.Mocked, jest.MockedClass　とかあるけど違いがよくわかってない
const mockedMember = MockedMember as jest.Mock
// mockImplementationに実装を書く
mockedMember.mockImplementation((id:string)=>{
  return new Member(id)
})

```

項番 1 のモックの設定は hoisting されるので、最初に設定される。
なので項番 2 の状態ではモックされているモジュールになっている。
モックされているモジュールに対して、さらにモックの変更を加えることで、以降
別の箇所で`service`モジュールを使用している箇所でその変更が反映される。

あんまりわかってないのが、`jest.mock`のときはクラスを渡していて、`mockImplementation`のときはインスタンスを返している点。

```javascript
class Member {}

// jest.mockで設定するとき
jest.mock("../../service", () => {
  return {
    Member: Member
  };
});

// mockImplementationで設定するとき
mockedMember.mockImplementation((id: string) => {
  return new Member(id);
});
```

`jest.mock`のときは、`service`モジュールをモックしているのに対して、`mockImplementation`は、Member クラスのモックの設定をしているっていう違いだと思う。

※とはいえ、どういう違いだろう。
https://jestjs.io/docs/ja/es6-class-mocks
