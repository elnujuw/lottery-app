# lottery-app

年会/活动现场抽奖系统，基于 `Vue 3 + Vite + Element Plus + IndexedDB`，支持 Web 使用和 Electron 打包。

## 功能概览

- 奖池配置：创建奖池、导入名单（按行导入）
- 奖项配置：奖项名称、数量、所属奖池
- 奖品展示信息：奖品名称、描述、图片动态配置
- 界面配置：背景图地址上传/配置，实时生效并持久化
- 抽奖动画：开始/停止抽奖，随机生成中奖人
- 结果管理：查看、单条删除、清空中奖记录

## 技术栈

- `Vue 3`
- `Vite`
- `Element Plus`
- `IndexedDB`
- `Electron`（可选桌面打包）

## 快速开始

### 1. 安装依赖

```bash
yarn install
```

### 2. 本地开发（Web）

```bash
yarn dev
```

### 3. 构建

```bash
yarn build
```

### 4. Electron 开发（可选）

```bash
yarn dev
yarn electron:dev
```

### 5. Electron 打包（Windows）

```bash
yarn electron:build:win
```

## 使用流程

1. 打开“抽奖配置”
2. 在“奖池配置”中创建奖池并导入名单
3. 在“奖项配置”中维护奖项和数量，并可配置奖品描述/图片
4. 在“界面配置”中设置背景图（支持地址或上传）
5. 点击“开始抽奖”，选择奖项和抽取数量后执行
6. 在“抽奖结果”中管理中奖记录

## 数据存储说明（IndexedDB）

主要表：

- `group_config`：奖池
- `user_list`：名单（含 `groupId`、`uuid`）
- `prize_config`：奖项与奖品展示配置
- `prize_winners`：中奖记录
- `app_config`：界面配置（如背景图）

说明：

- 数据全部保存在本地浏览器（或 Electron 本地环境）中
- 清理站点数据会导致抽奖配置和结果丢失
- 若你已保存过背景图配置，默认背景图不会覆盖已有配置

## 目录结构

```text
.
├─ electron/              # Electron 主进程
├─ src/
│  ├─ assets/             # 图片、音频、样式资源
│  ├─ components/         # 页面组件
│  ├─ helper/             # IndexedDB 与抽奖逻辑
│  └─ router/             # 路由
├─ dist/                  # Web 构建产物
└─ release/               # Electron 打包产物
```

## 常用命令

```bash
yarn dev
yarn build
yarn preview
yarn lint
yarn electron:dev
yarn electron:build
yarn electron:build:win
```
