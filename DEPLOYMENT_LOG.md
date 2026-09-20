# Frontend deployment record

## 2026-09-20 — Subscription engagement and hosted checkout

- Release commit: `495533a35114c1dd8bf7ff94fe869631245d0048`
- Incoming `master` repaired and verified on the deployment runtime (Node 16): 398 tests passed.
- Combined frontend verified on Node 16: 696 tests passed.
- Production browser build passed.
- Subscription lifecycle journey: 11 checks passed.
- Deployment target: existing GitHub Actions to Linode workflow.
- Deployment trigger: signed-in GitHub web commit after OAuth event suppression.
- GitHub Actions enabled before this trigger commit.
