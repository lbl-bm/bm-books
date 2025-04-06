import type {
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

export const siteConfig: SiteConfig = {
  title: 'LBL',
  subtitle: 'books',
  lang: 'zh_CN',         // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th' 语言选项
  themeColor: {
    hue: 250,         // 主题颜色的默认色调，范围从 0 到 360。例如：红色: 0，青色: 200，蓝绿色: 250，粉色: 345
    fixed: false,     // 隐藏访客的主题颜色选择器
  },
  banner: {
    enable: true,
    src: 'assets/images/banner.jpg',   // 相对于 /src 目录的路径。如果以 '/' 开头，则相对于 /public 目录
    position: 'top',      // 等同于 object-position，仅支持 'top', 'center', 'bottom'。默认为 'center'
    credit: {
      enable: false,         // 显示横幅图片的版权文字
      text: '',              // 要显示的版权文字
      url: ''                // （可选）指向原始作品或艺术家页面的 URL 链接
    }
  },
  toc: {
    enable: true,           // 在文章右侧显示目录
    depth: 3                // 目录中显示的最大标题深度，范围从 1 到 3
  },
  favicon: [    // 如果此数组为空，则使用默认的 favicon
    // {
    //   src: '/favicon/icon.png',    // favicon 的路径，相对于 /public 目录
    //   theme: 'light',              // （可选）'light' 或 'dark'，仅在为浅色和深色模式提供不同的 favicon 时设置
    //   sizes: '32x32',              // （可选）favicon 的尺寸，仅在提供不同尺寸的 favicon 时设置
    // }
  ]
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    {
      name: 'GitHub',
      url: 'https://github.com/lbl-bm',     // 内部链接不应包含基础路径，因为它会自动添加
      external: true,                               // 显示外部链接图标，并将在新标签页中打开
    },
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/avatar.jpg',  // 相对于 /src 目录的路径。如果以 '/' 开头，则相对于 /public 目录
  name: 'LBL',
  bio: 'To show what I can do.',
  links: [
    {
      name: 'Steam',
      icon: 'fa6-brands:steam',
      url: 'https://steamcommunity.com/profiles/76561199083380305/',
    },
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/lbl-bm',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}
