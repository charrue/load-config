
``` ts
// charrue.config.ts
import { defineConfig } from "@charrue/load-local-file";

type UserConfig = {
  name: string;
}

export default defineConfig<UserConfig>({
  name: "foo"
})

```

``` ts
import { loadConfig } from "@charrue/load-local-file";

const config = loadConfig("charrue.config.js") // { name: "foo" }
```