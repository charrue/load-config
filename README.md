## 功能说明

支持加载配置`.js`和`.ts`类型的配置文件，并提供了结果缓存的功能。

配置文件中支持使用第三方依赖。

## 下载

``` bash
npm install @charrue/load-config
```

## 使用

``` ts
// charrue.config.ts
import { defineConfig } from "@charrue/load-config";

type UserConfig = {
  name: string;
}

export default defineConfig<UserConfig>({
  name: "foo"
})

```

``` ts
import { loadConfig } from "@charrue/load-config";

const config = loadConfig("charrue.config.js") // { name: "foo" }
```