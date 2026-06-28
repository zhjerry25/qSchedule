# qSchedule

A personal time planner desktop app with a Todo list and Gantt chart.

**This project is fully vibe-coded. It is just for fun and it may not be robust.**
**This project is only tested on MacOS, it may not work properly on Windows/Linux system.**

个人时间规划桌面应用，提供 Todo 待办清单与甘特图功能

**此项目完全由ai编写，没有一点古法编程，程序可能不稳健**
**此项目仅在MacOS上进行过测试，程序可能无法在Windows/Linux系统上正常工作**

---

## English

### Features

- **Todo Dashboard** — Smart task partitioning (Today / This Week / Later) with frequency modes (once, daily, weekly, deadline)
- **Gantt Chart** — Visual project timeline with drag-to-reschedule, dependency lines, and milestone markers
- **Tags** — Color-coded tags with deterministic palette assignment
- **Tray Popup** — Quick today-at-a-glance
- **System Tray** — Keeps running in the tray; close hides to tray rather than quitting
- **i18n** — Full English and Chinese support
- **Offline-first** — All data stored locally via SQLite; no network required


### Quick Start

```bash
npm install
npm run dev
```

### Build & Package

```bash
npm run build
npm run dist
npm run dist:mac
npm run dist:win
npm run dist:linux
```

Outputs land in `release/`.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | Create new task |


## 中文

### 功能

- **待办看板** — 智能分区（今天 / 本周 / 以后），支持频次模式（单次、每日、每周、截止日期）
- **甘特图** — 可视化项目时间线，支持拖拽调整、依赖连线、里程碑标记
- **标签系统** — 彩色标签，确定性调色板分配
- **托盘弹窗** — 从菜单栏快速查看今日任务
- **系统托盘** — 关闭窗口即隐藏至托盘，不退出程序
- **双语支持** — 完整英文 / 中文界面
- **离线优先** — 所有数据通过 SQLite 本地存储，无需网络

### 快速开始

```bash
npm install
npm run dev
```

### 构建打包

```bash
npm run build
npm run dist:mac
npm run dist:win
npm run dist:linux
```

构建产物在 `release/` 目录。

### 快捷键

| 快捷键 | 功能 |
|----------|------|
| `Cmd/Ctrl + N` | 新建任务 |

---

## License

[MIT](LICENSE)
