# 點火 — 정유민 기획 포트폴리오

확신을 불씨로, 근거를 연료로.

## 페이지
- index.html — 點火 (메인)
- profile.html — 불씨 (프로필 · 심지)
- project.html — 발화 (프로젝트 6개)
- project/01–06.html — 발화 상세
- archive.html — 연료 (현장 기록)
- 404.html — 페이지 없음

## 문서 장표 · PDF 연결하는 법
각 project/0N.html 맨 아래 `window.PROJECT = {...}` 안의 문서마다
- `"slides": ["../assets/notomato/plan-01.png", ...]` — 장표 이미지 (넣으면 장 수가 자동으로 바뀜)
- `"pdf": "../assets/notomato/plan.pdf"` — PDF 보기 · 다운로드
- 작성이 끝난 문서는 `"planned": true`를 `false`로 바꾸면 문서 탭에 나타남

## 현장 기록 사진
archive.html 맨 아래 `window.ARCHIVE` 각 항목의 `"img": "assets/archive/01-1.jpg"`에 사진 경로를 넣으면 크게 보기에 표시됨.
