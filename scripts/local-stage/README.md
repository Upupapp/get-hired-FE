# Local frontend subscription staging

Uses the real EmployerSubscriptionModule and HTTP services with the backend local-stage server. The boot module provides only a synthetic company facade and local identity header, blocks external HttpClient requests, and points APIs to the same origin. Dedicated index omits production analytics, Maps and external fonts. These files are not imported by normal src/main.ts and do not change production boot/authentication.

From frontend root with project dependencies and Node 16:

```sh
NG_CLI_ANALYTICS=false node node_modules/@angular/cli/bin/ng.js build --configuration development --main scripts/local-stage/main.ts --index scripts/local-stage/index.html --ts-config scripts/local-stage/tsconfig.json --output-path /tmp/gethired-subscription-stage --source-map=false --progress=false
```

Start the companion backend scripts/local-stage/server.cjs with GETHIRED_STAGE_FRONTEND pointing to that output. Open http://127.0.0.1:4317/?scenario=internal. The banner switches between synthetic internal and ordinary trial accounts. Do not deploy this build to production or expose the stage publicly.

Browser checks completed: complimentary plan name/limits, absent purchase prompts, empty billing history, and ordinary-trial separation. This is a focused subscription stage, not a full Firebase login or candidate-workflow test. Backend README records substituted dependencies and database limitations. No production changes or paid deployment services were used.
