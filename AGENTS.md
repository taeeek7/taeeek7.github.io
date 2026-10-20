# Repository Guidelines

## Project Structure & Module Organization

This repository hosts Tin’s Log, a Korean-language blog built with Astro 5 and published on GitHub Pages.

- `src/pages/`: home, blog listings, article routes, tag pages, and RSS endpoint.
- `src/components/` and `src/layouts/`: shared Astro components and article layout.
- `src/content/blog/`: Markdown posts; `src/content.config.ts` defines their schema.
- `src/styles/global.css`: shared styles and light/dark theme variables.
- `src/consts.ts`: site metadata and links.
- `.github/workflows/deploy.yml`: build and deployment workflow.

Build output goes to `dist/`. No dedicated test or asset directory is currently tracked; keep generated files out of source changes.

## Build, Test, and Development Commands

- `npm ci`: install dependencies from `package-lock.json` reproducibly.
- `npm run dev`: start local development at `http://localhost:4321`.
- `npm run build`: generate the static site in `dist/` and validate content during compilation.
- `npm run preview`: serve the production build for local inspection.

## Coding Style & Naming Conventions

Follow existing two-space indentation, single-quoted JavaScript/TypeScript strings, and semicolons. TypeScript extends Astro’s strict configuration. Name reusable Astro components in PascalCase, such as `FormattedDate.astro`; follow Astro’s file-based routing conventions for pages. Reuse existing CSS theme variables. No formatter or linter is configured.

## Content & Testing Guidelines

Name posts `YYYY-MM-DD-slug.md`. Frontmatter requires `title`, `description`, and `pubDate`; optional fields include `updatedDate`, `tags`, and `draft`. Set `draft: true` for unpublished writing.

When writing or editing blog posts, you must read and apply `$humanizer:humanizer` from [`/Users/tin/.agents/skills/humanizer/SKILL.md`](/Users/tin/.agents/skills/humanizer/SKILL.md). Review the draft for AI writing patterns before finishing. Preserve the author's voice, experiences, technical meaning, and supported facts; do not invent details. During prose edits, keep code, commands, paths, frontmatter, data, and link targets unchanged unless the user requests those changes.

No automated test framework, test naming convention, or coverage threshold is configured. Run `npm run build` before submitting changes. Preview affected routes and check navigation, article links, tag filtering, responsive layout, and both themes when relevant. A successful build does not replace browser checks.

## Commit & Pull Request Guidelines

Recent commits use `post: <short Korean summary>` for article changes. Follow that convention for content and use concise, descriptive messages for other changes.

In pull requests, describe the change and record validation performed. Link related issues when applicable; include screenshots for visual changes. Pushing to `main` triggers deployment, so review the production build before merging. Preserve unrelated local edits and remove private infrastructure identifiers from published examples.
