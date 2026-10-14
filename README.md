# Eden Sheiko · Writing

Blog built with [Hugo](https://gohugo.io) (`C:\Users\edens\tools\hugo\hugo.exe`, v0.167.0).
Separate from the portfolio; same look.

```
content/posts/<slug>/index.md   articles (folder name = URL), images live next to them
layouts/                        page templates (article list, article)
static/                         styles.css, main.js, favicon (copied as-is)
hugo.toml                       site config (blog URL, portfolio link)
netlify.toml                    Netlify build settings
```

## Run it

Open a terminal **in this folder** (`C:\Users\edens\OneDrive\Desktop\cluade_run\blog`):

```powershell
C:\Users\edens\tools\hugo\hugo.exe server -D
```

Open http://localhost:1313. `-D` shows drafts too.

## Write an article

```powershell
C:\Users\edens\tools\hugo\hugo.exe new content posts/my-article/index.md
```

Set `draft: false` when it's ready, commit, push. Netlify builds and publishes it.
`content/posts/writing-guide/` is a cheat sheet for every feature; it stays a draft.

## Deploy

Push this folder to its own GitHub repo, then in Netlify: Add new site → Import from Git → pick the repo.
`netlify.toml` already tells Netlify how to build. If the site name isn't `edensheiko-blog`,
update `baseURL` in `hugo.toml`.
