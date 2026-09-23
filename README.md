# Pixel-Art Web Design

把一句需求变成风格一致的像素风网页：从网格、配色、字体、精灵缩放，到按钮、面板、动效与交付检查。

这是一个遵循 [Agent Skills](https://agentskills.io) 格式的设计技能。入口是 `SKILL.md`，可供 AtomCode、Pi、Codex、Claude Code、OpenCode 等支持该格式的 Agent 加载；不依赖特定模型、MCP 服务或前端框架。它提供设计流程和代码模式，不包含可直接启动的网站、字体或图片素材。

[下载稳定版](https://github.com/CacinieP/pixel-art-web-design/releases/latest) · [完整设计流程](./SKILL.md) · [MIT 许可证](./LICENSE)

## 快速安装：选择你的 Agent

使用第三方 [skills CLI](https://github.com/vercel-labs/skills) 安装，需要 Node.js（含 `npx`）和 Git。以下命令从 `main` 安装；需要固定版本时，使用下文的 Release ZIP。

**交互选择要安装到哪些 Agent：**

```bash
npx skills add CacinieP/pixel-art-web-design -g
```

**只安装到 Pi：**

```bash
npx skills add CacinieP/pixel-art-web-design -g -a pi -y
```

**同时安装到常用 Agent：**

```bash
npx skills add CacinieP/pixel-art-web-design -g -a pi codex claude-code opencode -y
```

**安装到 skills CLI 支持的所有 Agent：**

```bash
npx skills add CacinieP/pixel-art-web-design -g --all
```

`-g` 表示用户级安装，所有项目可用；去掉它则安装到当前项目。`--all` 会为 CLI 支持的所有 Agent 写入技能目录，即使某些 Agent 尚未安装；仅使用少数工具时，选交互模式或 `-a`。这不是对所有现有或未来 Agent 的兼容保证，完整支持列表以 [CLI 文档](https://github.com/vercel-labs/skills#supported-agents) 为准。

### AtomCode：直接安装

AtomCode 使用自己的技能目录。截至本次验证使用的 `skills` CLI 1.7.0，其目标列表尚未包含 AtomCode；上面的 `--all` 不会替代本节安装步骤，也不要使用未经支持的 `-a atomcode`。

**从 AtomGit 私有仓库安装**（macOS / Linux，需要 Git 和仓库访问权限）：

```bash
mkdir -p "${ATOMCODE_HOME:-$HOME/.atomcode}/skills"
git clone https://atomgit.com/Cacinie/pixel-art-web-design.git \
  "${ATOMCODE_HOME:-$HOME/.atomcode}/skills/pixel-art-web-design"
```

如果使用 GitHub 登录，第二步可改为：

```bash
gh repo clone CacinieP/pixel-art-web-design \
  "${ATOMCODE_HOME:-$HOME/.atomcode}/skills/pixel-art-web-design"
```

**离线安装**：下载 Release ZIP，将整个 `pixel-art-web-design/` 文件夹解压到 `${ATOMCODE_HOME:-$HOME/.atomcode}/skills/`。默认安装结果应为 `~/.atomcode/skills/pixel-art-web-design/SKILL.md`，并保留同层 `references/`。

```bash
mkdir -p "${ATOMCODE_HOME:-$HOME/.atomcode}/skills"
unzip ~/Downloads/pixel-art-web-design-v1.0.1.zip \
  -d "${ATOMCODE_HOME:-$HOME/.atomcode}/skills"
```

Windows 可将文件夹放入 `%USERPROFILE%\.atomcode\skills\`；若已设置 `ATOMCODE_HOME`，则使用该目录下的 `skills`。上述克隆命令用于首次安装；已有同名目录时请按“更新与卸载”操作。

### 私有仓库如何下载

仓库当前为私有，需要你的 GitHub 账号拥有访问权限。浏览器下载前先登录 GitHub；命令行可先通过 GitHub CLI 登录：

```bash
gh auth login
```

如果直接安装出现 `404` 或认证错误，先克隆，再从本地安装：

```bash
gh repo clone CacinieP/pixel-art-web-design
npx skills add ./pixel-art-web-design -g -a pi codex claude-code opencode -y
```

### 从 AtomGit 私有镜像安装

镜像地址：[Cacinie/pixel-art-web-design](https://atomgit.com/Cacinie/pixel-art-web-design)。使用已配置的 AtomGit Git 凭据，在一个尚无同名目录的位置执行：

```bash
git clone https://atomgit.com/Cacinie/pixel-art-web-design.git
npx skills add ./pixel-art-web-design -g -a pi codex claude-code opencode -y
```

要安装到 CLI 支持的所有 Agent，将最后的 `-a pi codex claude-code opencode -y` 换为 `--all`。GitHub 登录不能代替 AtomGit 登录；私有镜像同样需要仓库访问权限。

## 从 Release ZIP 安装：无需 Node.js

1. 打开 [Releases](https://github.com/CacinieP/pixel-art-web-design/releases)，下载附件 `pixel-art-web-design-v1.0.1.zip`。
2. 解压，得到 `pixel-art-web-design/` 文件夹。
3. 将**整个文件夹**放入下表中目标 Agent 的技能目录，保留 `references/`。
4. 在 Agent 中重新加载技能或开始新会话，再按下文调用。

下面是常用默认路径；若你自定义了 Agent 的配置目录，以实际配置为准。每个路径下都应有 `pixel-art-web-design/SKILL.md`。

| Agent | 用户级技能目录 | 项目级技能目录 |
| --- | --- | --- |
| AtomCode | `~/.atomcode/skills/` | `.atomcode/skills/` |
| Pi | `~/.pi/agent/skills/` | `.pi/skills/` |
| Codex | `~/.codex/skills/` | `.agents/skills/` |
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| OpenCode | `~/.config/opencode/skills/` | `.agents/skills/` |
| Cursor | `~/.cursor/skills/` | `.agents/skills/` |
| Gemini CLI | `~/.gemini/skills/` | `.agents/skills/` |
| GitHub Copilot | `~/.copilot/skills/` | `.agents/skills/` |

AtomCode 使用上面的直接安装方式；其他工具的批量安装映射见 [skills CLI 支持列表](https://github.com/vercel-labs/skills#supported-agents)。`~` 表示用户主目录；Windows 可在资源管理器中使用 `%USERPROFILE%`，再按对应路径创建文件夹。Pi 也支持共享的 `~/.agents/skills/` 和项目 `.agents/skills/`，已有共享安装时无需重复复制。

例如，macOS / Linux 下载 ZIP 后安装到 Pi：

```bash
mkdir -p ~/.pi/agent/skills
unzip ~/Downloads/pixel-art-web-design-v1.0.1.zip -d ~/.pi/agent/skills
```

正确结构如下，不能只复制 `SKILL.md`，也不要额外嵌套一层同名文件夹：

```text
~/.pi/agent/skills/pixel-art-web-design/
├── SKILL.md
├── README.md
├── LICENSE
└── references/
    ├── bevel-system.md
    └── palette-construction.md
```

其他支持 Agent Skills 的工具也可以使用同一个文件夹，放入它们自己的技能搜索目录即可。没有技能加载机制的工具，可以让它读取 `SKILL.md` 和所引用的参考文件；这种方式不会自动注册技能。

## 如何调用

### AtomCode

在 AtomCode 中输入 `/skills` 查看技能列表，再使用技能命令：

```text
/pixel-art-web-design 帮我做一个咖啡店的像素风落地页，暖色农场风，纯 HTML + CSS，适配手机。
```

也可以直接说“请使用 pixel-art-web-design 技能”，由 Agent 加载。AtomCode 5.1.0 支持自动刷新新增技能；若未发现，重开 AtomCode 后检查目录。仅供当前项目使用时，将完整技能文件夹放到项目的 `.atomcode/skills/`；同名项目技能会覆盖用户级技能。详见 [AtomCode 官方 Skills 文档](https://atomcode.atomgit.com/docs/zh/skills.html)。

### Pi

在现有会话中输入 `/reload` 刷新，然后显式调用：

```text
/skill:pixel-art-web-design 帮我做一个咖啡店的像素风落地页，暖色农场风，纯 HTML + CSS，适配手机。
```

输入 `/skill:` 后应能看到技能补全。Pi 的加载与调用规则见 [官方 Skills 文档](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md)。

### Codex

```text
$pixel-art-web-design 帮我设计一个像素风个人主页，现代柔和风格，使用 React，支持键盘操作和减少动效。
```

### Claude Code 与其他 Agent

Claude Code 可使用 `/pixel-art-web-design`。其他 Agent 可以在提示中明确写：

```text
请使用 pixel-art-web-design 技能，制作一个像素风产品介绍页。
主题：独立游戏工具；风格：电影感 HD-2D；输出：HTML + CSS；需要适配手机。
```

优先说明**页面用途、风格方向、输出技术和约束**。技能支持四个风格基底，也可以从你提供的参考图出发：

| 风格 | 适合的场景 |
| --- | --- |
| A · 角色 / MV | 单角色、情绪场景、叙事展示 |
| B · 暖色农场 / 瓦片 | 咖啡店、农场、城镇、温馨商业页面 |
| C · 电影感 HD-2D | 剧情、冒险、戏剧性光影 |
| D · 现代柔和 | 产品、应用界面、个人主页 |

## 安装后检查

- Agent 能发现 `pixel-art-web-design`；Pi 中可通过 `/skill:` 补全确认。
- AtomCode 中可通过 `/skills` 查看，并使用 `/pixel-art-web-design` 调用。
- 让 Agent 读取技能，能找到两个 `references/` 文件。
- 用上面的示例需求试一次：输出应包含网格、配色、精灵缩放、组件状态，以及响应式与可访问性检查。

只在配置里列出技能名称不代表整个设计流程已经执行。具体页面仍需要浏览器检查；字体和图片需由项目提供或另行制作。

## 更新与卸载

- **CLI 安装**：重新运行原来的安装命令，安装该来源的当前版本；先备份你对已安装文件做过的修改。
- **本地克隆安装**：先在仓库目录执行 `git pull --ff-only` 获取远程更新，再重新运行本地 `skills add` 命令。
- **AtomCode 直接克隆安装**：在其 `skills/pixel-art-web-design/` 目录执行 `git pull --ff-only` 即可，无需再运行 `skills add`。
- **ZIP 安装**：下载新版 Release，备份并移走原技能文件夹，再放入新版，避免新旧参考文件混用。
- **CLI 卸载**：使用下面的命令，仅移除这个技能：

```bash
npx skills remove pixel-art-web-design -g -a '*'
```

- **手动卸载**：移走对应目录中的 `pixel-art-web-design/` 文件夹。之后重新加载技能。

## 常见问题

**下载显示 404？** 检查是否已登录有仓库权限的 GitHub 账号。私有仓库不能匿名下载，Release 附件也一样。

**Agent 找不到技能？** 检查安装作用域、目录层级、文件名 `SKILL.md`，以及是否需要重新加载。Pi 使用 `/reload`；其他工具可重开会话，仍未刷新时重启客户端。

**Pi 没有 `/skill:` 命令补全？** 检查 Pi 设置中的 `enableSkillCommands` 是否开启；关闭补全时仍可尝试输入完整命令，详见 Pi 官方文档。

**符号链接安装失败？** 给 `skills add` 添加 `--copy`，或直接使用 Release ZIP 手动安装。

**`skills --all` 后 AtomCode 仍找不到？** CLI 1.7.0 尚未包含 AtomCode 目标，请使用本页的 AtomCode 直接安装步骤。

**需要 API Key 或 npm install 吗？** 技能本身不需要。Agent 的模型服务、生成图片以及你所选的网页框架，可能各自需要配置或依赖。

## 包含哪些内容

- [`SKILL.md`](./SKILL.md)：从需求到交付的设计流程，包含六项原则、设计令牌、八类组件、动效与检查清单。
- [`references/bevel-system.md`](./references/bevel-system.md)：凸起 / 按下两种像素倒角与阴影规则。
- [`references/palette-construction.md`](./references/palette-construction.md)：色阶构建、四组预设色板与颜色数量约束。

源码维护在 `main`；版本 ZIP 作为 Release 附件发布，不再提交到主分支。

## License

[MIT](./LICENSE)，可使用、修改和再分发。
