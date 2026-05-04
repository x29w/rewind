# Rewind Agent Hooks

## 📋 已配置的 Hooks

### 1. Update Changelog
**触发时机**：手动触发  
**功能**：查看自上次 commit 以来的变更，更新 CHANGELOG.md

**使用方法**：
在 Kiro 中手动触发此 hook，Agent 会自动：
1. 查看所有文件变更
2. 总结更新内容
3. 更新 CHANGELOG.md

**无需额外脚本，完全由 Agent 智能处理**

---

### 2. Generate Conversation Memory
**触发时机**：手动触发  
**功能**：生成对话记忆文档，记录项目当前状态，用于新对话恢复上下文

**使用方法**：
在 Kiro 中手动触发此 hook，Agent 会自动生成 `CONVERSATION_MEMORY.md`，包含：
- 项目概述和当前状态
- 已完成任务和待办事项
- 目录结构和技术栈
- 重要文件索引
- 上下文提示

**使用场景**：
- 对话上下文即将满时
- 需要开启新对话前
- 项目交接或协作时

---

### 3. Validate Code Standards
**触发时机**：每次使用 write 类工具后（生成/修改代码后）  
**功能**：自动检查代码是否符合 `docs/development/rules.md` 规范

**检查项**：
- ✅ 文件命名是否使用 kebab-case
- ✅ 是否有完整的多语言注释（中英日文）
- ✅ 类型定义是否使用 namespace
- ✅ Dashboard 中是否有不必要的 useEffect/useCallback
- ✅ 是否有动态 import
- ✅ 是否使用了 setTimeout 处理业务逻辑

**行为**：发现不符合规范的代码会自动提示并修正

---

### 4. Sync Docs with Implementation
**触发时机**：每次使用 write 类工具后（生成/修改代码后）  
**功能**：检查实现是否与设计文档一致，如不一致则更新文档

**检查项**：
- 📁 目录结构是否与设计文档一致
- 🔌 API 接口定义是否有变化
- 🗄️ 数据库 Schema 是否有调整
- 🧩 组件结构或命名是否不同
- 🛠️ 技术选型是否有变更

**行为**：发现不一致时会自动更新 docs/ 目录下的对应文档

---

### 5. Check Gitignore
**触发时机**：每次使用 write 类工具后（生成/修改代码后）  
**功能**：检查新创建的文件或目录是否需要添加到 .gitignore

**检查项**：
- 🔒 环境变量文件（.env, .env.local 等）
- 📦 依赖目录（node_modules, dist, build 等）
- 🗄️ 数据库文件（*.db, *.sqlite, dump.rdb 等）
- 🔑 密钥和证书文件（*.key, *.pem, *.crt 等）
- 📝 日志文件（*.log, logs/ 等）
- 🧪 测试覆盖率报告（coverage/ 等）
- 💾 IDE 和编辑器配置（.vscode/, .idea/ 等）
- 🗂️ 临时文件和缓存（.cache/, .turbo/ 等）

**行为**：发现应该被忽略但未在 .gitignore 中的文件时，自动添加到 .gitignore

**使用场景**：
- 创建新的配置文件时
- 添加新的构建产物目录时
- 引入新的开发工具时
- 防止敏感信息被提交

---

### 6. Load Conversation Memory
**触发时机**：每次提交 prompt 时（对话开始前）  
**功能**：自动读取对话记忆文档，恢复项目上下文

**使用方法**：
此 hook 会在每次对话开始前自动触发，Agent 会：
1. 检查 `CONVERSATION_MEMORY.md` 是否存在
2. 如果存在，读取并理解项目上下文
3. 基于记忆提供更准确的回答

**优势**：
- 🔄 自动恢复上下文，无需手动说明
- 📝 保持对话连贯性
- 🎯 提供更精准的技术建议
- ⚡ 减少重复解释项目背景的时间

**配合使用**：
与 "Generate Conversation Memory" hook 配合使用：
1. 对话上下文即将满时，手动触发生成记忆
2. 开启新对话时，此 hook 自动加载记忆
3. 无缝继续开发工作

---

## 🔧 Hook 配置说明

所有 hooks 配置文件位于 `.kiro/hooks/` 目录，使用 JSON 格式。

### Hook 文件结构

```json
{
  "name": "Hook 名称",
  "version": "1.0.0",
  "description": "Hook 描述",
  "when": {
    "type": "触发类型",
    "toolTypes": ["工具类型过滤"]
  },
  "then": {
    "type": "动作类型",
    "prompt": "提示内容（askAgent）",
    "command": "命令（runCommand）"
  }
}
```

### 触发类型 (when.type)

- `userTriggered`: 手动触发
- `fileEdited`: 文件编辑后
- `fileCreated`: 文件创建后
- `fileDeleted`: 文件删除后
- `promptSubmit`: 提交 prompt 后
- `agentStop`: Agent 执行完成后
- `preToolUse`: 工具使用前
- `postToolUse`: 工具使用后
- `preTaskExecution`: 任务执行前
- `postTaskExecution`: 任务执行后

### 动作类型 (then.type)

- `askAgent`: 向 Agent 发送提示
- `runCommand`: 执行 shell 命令

### 工具类型过滤 (toolTypes)

- `read`: 读取类工具
- `write`: 写入类工具
- `shell`: Shell 命令
- `web`: Web 相关工具
- `spec`: Spec 相关工具
- `*`: 所有工具
- 正则表达式：如 `.*sql.*` 匹配包含 sql 的工具名

---

## 📝 添加新 Hook

1. 在 `.kiro/hooks/` 目录创建新的 JSON 文件
2. 按照上述结构编写配置
3. 保存后 Kiro 会自动加载

**示例**：

```json
{
  "name": "Run Tests After Code Change",
  "version": "1.0.0",
  "description": "代码修改后自动运行测试",
  "when": {
    "type": "fileEdited",
    "patterns": ["packages/**/*.ts", "packages/**/*.tsx"]
  },
  "then": {
    "type": "runCommand",
    "command": "pnpm test",
    "timeout": 60
  }
}
```

---

## 🚨 注意事项

1. **循环依赖**：preToolUse hooks 可能导致无限循环，需谨慎配置
2. **性能影响**：postToolUse hooks 会在每次工具使用后触发，避免耗时操作
3. **权限检查**：如果 hook 输出明确拒绝访问，工具调用会被阻止
4. **超时设置**：runCommand 类型的 hook 建议设置 timeout 避免阻塞

---

## 🔄 Hook 生命周期

```
用户操作/事件发生
    ↓
检查是否有匹配的 hook
    ↓
执行 hook 动作
    ↓
  askAgent → Agent 处理提示 → 可能修改代码/文档
  runCommand → 执行命令 → 返回结果
    ↓
继续原有流程
```

---

## 📚 相关文档

- [开发规范](../../docs/development/rules.md)
- [设计文档](../../docs/design/)
- [PRD](../../docs/PRD/PRD.md)
