---
description: Immigration application audit
argument-hint: <case-directory> [--tier ultra|pro|guest] [--app spousal|study]
---

用os-app-builder agent,根据用户输入，最终生成一个完整的app.

### Principle

- 如果当前没有用户给定的documetn list, 必须使用mcp功能获取document checklist.
- 所有知识，必须使用detective agent获取。 只在检测有没有更新内容的时候 才从iRCC网站获取是否有更新内容。
- 如果一种app里面 有很多分类，在构建skill的时候 在references里面分别添加各类的专有知识.md文件

比如 work:

- PGWP.md
- LMIA.md
- PNP.md
- spouse-open-workpermit.md
  ...

### user input

$ARGUMENTS
