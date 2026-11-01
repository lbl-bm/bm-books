# LBL 的个人博客

基于 [Fuwari](https://github.com/saicaca/fuwari) 的 Astro 静态博客。保留原有主题，使用 Markdown 写作、Pagefind 全文搜索和 GitHub Pages 静态部署，不需要常驻服务器。

目前公开文章仍是明确标记的模板演示；它们用于检查排版和功能，不代表个人原创文章。新增内容前请先完善自己的简介、文章和图片来源记录。

## 本地开发

使用 Node.js 24（见 `.node-version`）和 pnpm 9.14.4（见 `packageManager`），然后运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

本地入口：`http://localhost:4321/bm-books/`。

| 命令 | 用途 |
| --- | --- |
| `pnpm new-post my-note` | 新建 Markdown 草稿，不覆盖已有文件 |
| `pnpm check` | Astro 检查、TypeScript 声明检查、行为测试 |
| `pnpm build` | 生产构建并生成 Pagefind 索引 |
| `pnpm verify:build` | 检查产物中的基路径、链接、RSS、sitemap 和草稿排除 |
| `pnpm preview` | 预览完整生产版本，包括真实搜索 |

开发服务器中的搜索明确使用演示数据。搜索验收请使用 `pnpm build && pnpm preview`。

## 写作与发布

文章位于 `src/content/posts/`。新建文章默认 `draft: true`；缺少 `draft` 字段也按草稿处理。开发模式可预览草稿，生产页面、归档、标签和 RSS 会排除草稿。

```yaml
---
title: "填写文章标题"
published: 2026-11-01
description: "用一句话说明读者能从文章中得到什么"
tags: []
category: ""
draft: true
lang: "zh-CN"
---
```

准备发布时检查标题、摘要、日期、链接和图片来源，将 `draft` 改为 `false`，再运行 `pnpm check && pnpm build && pnpm verify:build`。通过生产预览确认后提交。不要将 API 密钥、`.env`、私人数据或未经确认授权的素材写入文章。

可选的 VS Code Front Matter 配置已对齐 `lang` 字段与 `/bm-books/posts/` 预览入口。编辑器默认创建平铺的 `.md` 文件；使用子目录时需相应核对预览路径。

## GitHub Pages

目标地址：`https://lbl-bm.github.io/bm-books/`。`astro.config.mjs` 中的 `site` 是域名，`base` 是 `/bm-books`；两者分别负责绝对地址和仓库子路径。

工作流 `.github/workflows/deploy.yml` 使用锁文件安装、检查、构建和验证产物，通过标准 Pages artifact 部署。推送到 `main` 或手动触发工作流会部署；PR 只检查和构建。

仓库 Settings → Pages 的 Source 应为 **GitHub Actions**。部署是否成功以 Actions 的最终状态和实际网页为准。若将来更换域名或仓库路径，需要同时调整 Astro 配置、编辑器预览和产物验证脚本。

## 许可与素材

模板代码沿用根目录 MIT 许可及 saicaca 版权声明。文章页的许可配置位于 `src/config.ts`，当前为 CC BY-NC-SA 4.0；这不替代第三方文章和图片各自的授权。头像、横幅等素材的原始来源仍需作者确认，不能由模板的代码许可推定。
