import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import Compress from "astro-compress";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* 渲染自定义指令内容 */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* 处理指令 */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://fuwari.vercel.app/",
  base: "/",
  trailingSlash: "always",
  integrations: [
    tailwind(
        {
          nesting: true,
        }
    ),
    swup({
      theme: false,
      animationClass: "transition-swup-", // 参见 https://swup.js.org/options/#animationselector
      // 默认值 `transition-` 会导致延迟过渡
      // 当使用 Tailwind 类 `transition-all` 时
      containers: ["main", "#toc"],
      smoothScrolling: true, // 平滑滚动
      cache: true, // 缓存
      preload: true, // 预加载
      accessibility: true, // 无障碍支持
      updateHead: true, // 更新 <head>
      updateBodyClass: false, // 不更新 <body> 的 class
      globalInstance: true, // 全局实例
    }),
    icon({
      include: {
        "preprocess: vitePreprocess(),": ["*"],
        "fa6-brands": ["*"],
        "fa6-regular": ["*"],
        "fa6-solid": ["*"],
      },
    }),
    svelte(),
    sitemap(),
    Compress({
      CSS: false, // 不压缩 CSS
      Image: false, // 不压缩图片
      Action: {
        Passed: async () => true, // 参见 https://github.com/PlayForm/Compress/issues/376
      },
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkReadingTime, // 阅读时间
      remarkExcerpt, // 摘要
      remarkGithubAdmonitionsToDirectives, // 将 GitHub 风格的提示转换为指令
      remarkDirective, // 处理指令
      remarkSectionize, // 分段
      parseDirectiveNode, // 解析指令节点
    ],
    rehypePlugins: [
      rehypeKatex, // 数学公式支持
      rehypeSlug, // 为标题生成 slug
      [
        rehypeComponents,
        {
          components: {
            github: GithubCardComponent, // GitHub 卡片组件
            note: (x, y) => AdmonitionComponent(x, y, "note"), // 提示组件
            tip: (x, y) => AdmonitionComponent(x, y, "tip"), // 小贴士组件
            important: (x, y) => AdmonitionComponent(x, y, "important"), // 重要组件
            caution: (x, y) => AdmonitionComponent(x, y, "caution"), // 注意组件
            warning: (x, y) => AdmonitionComponent(x, y, "warning"), // 警告组件
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append", // 附加行为
          properties: {
            className: ["anchor"], // 锚点类名
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["anchor-icon"], // 锚点图标类名
              "data-pagefind-ignore": true, // 忽略 Pagefind
            },
            children: [
              {
                type: "text",
                value: "#", // 锚点符号
              },
            ],
          },
        },
      ],
    ],
  },
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // 暂时抑制此警告
          if (
            warning.message.includes("is dynamically imported by") &&
            warning.message.includes("but also statically imported by")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
});
