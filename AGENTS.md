# GetHired frontend rules

- Never consume GitHub Actions credits or minutes. Before every push verify Actions are disabled for Upupapp/get-hired-FE. Never enable or dispatch workflows.
- Never touch LGUIDS tenant, data or configuration.
- Run checks locally and use direct deployment only when rollout is ready. Do not trigger Netlify builds.
- This isolated worktree prepares frontend compatibility for internal complimentary access. Do not grant production access or clear production payment flags here.
