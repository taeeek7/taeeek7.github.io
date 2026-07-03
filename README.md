# Tin's Log

데이터·AI 프로덕트를 만드는 과정을 기록하는 블로그. — 이태경 (Tin)

**Live:** https://taeeek7.github.io · **Stack:** Astro 5 + GitHub Pages

## 개발

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 로 정적 빌드
npm run preview  # 빌드 결과 미리보기
```

> Astro 6+는 Node 22를 요구합니다. 로컬 Node가 20이면 `astro@5`에 고정되어 있어 그대로 동작합니다.
> CI(배포)는 Node 22를 사용합니다.

## 글 쓰기

`src/content/blog/` 에 마크다운 파일을 추가하면 됩니다.

```markdown
---
title: '제목'
description: '한 줄 설명 (목록·메타에 노출)'
pubDate: 2026-07-03
tags: ['tag1', 'tag2']
draft: false   # true면 빌드에서 제외
---

본문...
```

파일명은 `YYYY-MM-DD-slug.md` 권장 (URL은 파일명 기준: `/blog/<파일명>/`).

## 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드→배포합니다 (`.github/workflows/deploy.yml`).

⚙️ **최초 1회 설정 필요**: GitHub 저장소 → Settings → Pages → Build and deployment →
**Source: GitHub Actions** 로 변경.

## 구조

```
src/
├─ components/   BaseHead, Header, Footer, FormattedDate
├─ layouts/      BlogPost.astro
├─ pages/        index, blog/index, blog/[...slug], rss.xml
├─ content/blog/ 글 (마크다운)
├─ styles/       global.css (라이트/다크 테마)
└─ consts.ts     사이트 제목·설명·링크
```

---
_이전 Jekyll(minimal-mistakes) 버전은 git 히스토리에 보존되어 있습니다._
