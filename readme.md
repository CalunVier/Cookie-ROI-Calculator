# Cookie ROI Calculator

一个 Cookie Clicker 的性价比计算器 Mod，帮助玩家更好地决策建筑物的升级投资。

## 预览

![alt text](scripts/image.png)

## 功能

- 实时计算每个建筑的投资回报率（ROI）
- 显示标准化后的性价比（相对最优选择的百分比）
- 显示建筑物的性价比排名
- 计算每个建筑的投资回本时间
- 多语言支持（当前支持中文和英文）

## 安装
本项目发布在steam创意工坊
### 手动安装 Steam 版本

1. 进入游戏的 mods 目录：
   ```
   [Steam安装目录]/steamapps/common/Cookie Clicker/resources/app/mods/local/
   ```

2. 创建新文件夹 `cookie_roi_calculator`

3. 将发布文件复制到该文件夹：
   - `main.js`
   - `lang.js`

4. 在游戏中启用 mod

### 开发者安装

1. 克隆仓库：
   ```bash
   git clone [仓库地址]
   cd cookie_roi_calculator
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 构建项目：
   ```bash
   npm run build:all
   ```

## 开发

### 项目结构

```
cookie_roi_calculator/
├── src/
│   ├── locales/        # 语言文件
│   │   ├── en.js      # 英文翻译
│   │   └── zh-CN.js      # 中文翻译
│   ├── config.js       # 配置文件
│   └── main.js         # 主要逻辑
├── scripts/
│   └── generateLang.js # 语言文件生成脚本
├── dist/               # 构建输出目录
├── package.json
└── rollup.config.js
```

### 可用的 npm 命令

- `npm run build:all` - 构建项目
- `npm run watch` - 开发模式（监视文件变化）

### 添加新语言

1. 在 `src/locales` 目录下创建新的语言文件（例如 `ja.js`）：
   ```javascript
   export default {
       ModLoaded: '...',
       Calculating: '...',
       // ... 其他翻译
   };
   ```

2. 运行生成命令：
   ```bash
   npm run build:all
   ```

## 使用说明

安装并启用 mod 后，每个建筑物的描述中将添加以下信息：

- **ROI**: 每秒投资回报率
- **归一化ROI**: 与当前最佳投资选择的比较（百分比）
- **排名**: 在所有建筑中的排名
- **回本时间**: 投资回收所需时间

## 贡献

欢迎提交 Pull Request 或创建 Issue！


## 致谢

- Cookie Clicker by Orteil