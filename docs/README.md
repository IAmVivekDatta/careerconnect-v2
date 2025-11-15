# Documentation Overview

All project documentation that is not required for day-to-day development lives inside this directory to keep the repository root clean.

- `archive/` contains historical deployment notes, progress reports, and verification checklists kept for reference.
- Add any new long-form documents here rather than at the repository root.

If a document becomes part of the active workflow (for example, onboarding instructions or architectural decisions), consider promoting a concise version to the main `README.md` and moving the detailed notes into `docs/archive/`.


Git still shows several files unstaged (today’s COOP/socket tweaks plus the earlier realtime changes and those doc deletions). From careerconnect-v2, here’s how to ship everything:

Review the pending deletions/edits so nothing surprises you:
git status
git diff

Stage the whole snapshot once you’re comfortable:
git add -A

Confirm the staged set:
git status
git diff --staged

Commit (swap in your message if you prefer another summary):
git commit -m "Adjust headers and sockets for realtime support"

Push to GitHub:
git push origin main