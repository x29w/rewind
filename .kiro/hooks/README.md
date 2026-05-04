# Rewind Agent Hooks

## 📋 Configured Hooks

### 1. Update Changelog
**Trigger**: Manual  
**Function**: Review changes since last commit and update CHANGELOG.md

**Usage**:
Manually trigger this hook in Kiro, and the Agent will automatically:
1. Review all file changes
2. Summarize updates (in English)
3. Update CHANGELOG.md

**Fully automated by Agent, no additional scripts needed**

---

### 2. Generate Conversation Memory
**Trigger**: Manual  
**Function**: Generate conversation memory document to record current project state for context recovery in new conversations

**Usage**:
Manually trigger this hook in Kiro, and the Agent will automatically generate `CONVERSATION_MEMORY.md`, including:
- Project overview and current status
- Completed tasks and TODOs
- Directory structure and tech stack
- Important file index
- Context hints

**Use Cases**:
- When conversation context is about to reach limit
- Before starting a new conversation
- During project handoff or collaboration

---

### 3. Load Conversation Memory
**Trigger**: On prompt submit (before each conversation)  
**Function**: Automatically read conversation memory document to restore project context

**Usage**:
This hook automatically triggers before each conversation. The Agent will:
1. Check if `CONVERSATION_MEMORY.md` exists
2. If exists, read and understand project context
3. Provide more accurate responses based on memory

**Advantages**:
- 🔄 Automatic context recovery, no manual explanation needed
- 📝 Maintain conversation continuity
- 🎯 Provide more precise technical suggestions
- ⚡ Reduce time spent re-explaining project background

**Works With**:
Use together with "Generate Conversation Memory" and "Pre-Code Context Check" hooks:
1. When conversation context is about to reach limit, manually trigger memory generation
2. When starting new conversation, this hook automatically loads memory
3. Before any coding operation, "Pre-Code Context Check" ensures context is loaded
4. Seamlessly continue development work

---

### 4. Pre-Code Context Check
**Trigger**: Before write operations (preToolUse on write tools)  
**Function**: Verify conversation memory is loaded before any coding/file modification operations

**Usage**:
This hook automatically triggers before any write operation. The Agent will:
1. Check if conversation memory context has been loaded in current conversation
2. If not loaded yet, read `CONVERSATION_MEMORY.md` to understand project state
3. Proceed with write operation using full context

**Check Items**:
- ✅ Current project status and phase
- ✅ Completed tasks and pending TODOs
- ✅ Development standards and conventions
- ✅ Tech stack decisions and constraints
- ✅ Important architectural decisions

**Advantages**:
- 🎯 Ensures all coding operations have full project context
- 🚫 Prevents context-unaware code changes
- 📚 Maintains consistency with project standards
- 🔄 Works seamlessly with "Load Conversation Memory" hook

**Works With**:
Complements "Load Conversation Memory" hook:
- "Load Conversation Memory" loads context at conversation start
- "Pre-Code Context Check" ensures context is available before coding
- Together they provide comprehensive context management

---

### 5. Post-Write Quality Check
**Trigger**: After using write tools (after generating/modifying files)  
**Function**: Comprehensive code quality check covering 4 aspects

**Check Items**:

#### 4.1 Code Standards Validation (if code files were modified)
- ✅ File naming uses kebab-case
- ✅ Public APIs have complete multi-language comments (Chinese, English, Japanese)
- ✅ Type definitions use namespace
- ✅ No unnecessary useEffect/useCallback in Dashboard
- ✅ No dynamic imports (except React lazy loading)
- ✅ No setTimeout for business logic

#### 4.2 Documentation Sync (if implementation files were modified)
- 📁 Directory structure matches design docs
- 🔌 API interface definitions changed
- 🗄️ Database schema adjusted
- 🧩 Component structure or naming different
- 🛠️ Tech stack changed

#### 4.3 Gitignore Update (if new files/directories were created)
- 🔒 New file types (temp files, logs, build outputs)
- 📦 New directories (sensitive info, temp data, build outputs)
- 🔑 Sensitive information (API keys, certificates, config files)
- 💾 IDE/editor config files
- 🗂️ Package manager caches, build caches
- 🗄️ Database files, backup files

#### 4.4 README Update Check (if significant features/changes were made)
- 📝 New feature descriptions
- 🚀 Installation steps changed
- 📦 New dependencies
- 🔧 API usage changed
- 🏗️ Architecture updates

**Behavior**:
- Automatically fix or update when issues found
- Skip code validation for documentation-only changes
- Brief confirmation for minor changes
- Only take action when necessary

**Advantages**:
- 🎯 Complete all quality checks at once
- 🚀 Automated quality assurance
- 📚 Keep docs and code in sync
- 🔒 Prevent sensitive information leaks
- 📖 Keep README always up-to-date

---

## 🔧 Hook Configuration

All hook configuration files are located in `.kiro/hooks/` directory, using JSON format.

### Hook File Structure

```json
{
  "name": "Hook Name",
  "version": "1.0.0",
  "description": "Hook Description",
  "when": {
    "type": "Trigger Type",
    "toolTypes": ["Tool Type Filter"]
  },
  "then": {
    "type": "Action Type",
    "prompt": "Prompt Content (askAgent)",
    "command": "Command (runCommand)"
  }
}
```

### Trigger Types (when.type)

- `userTriggered`: Manual trigger
- `fileEdited`: After file edit
- `fileCreated`: After file creation
- `fileDeleted`: After file deletion
- `promptSubmit`: After prompt submission
- `agentStop`: After agent execution completes
- `preToolUse`: Before tool use
- `postToolUse`: After tool use
- `preTaskExecution`: Before task execution
- `postTaskExecution`: After task execution

### Action Types (then.type)

- `askAgent`: Send prompt to Agent
- `runCommand`: Execute shell command

### Tool Type Filters (toolTypes)

- `read`: Read tools
- `write`: Write tools
- `shell`: Shell commands
- `web`: Web-related tools
- `spec`: Spec-related tools
- `*`: All tools
- Regex patterns: e.g., `.*sql.*` matches tool names containing "sql"

---

## 📝 Adding New Hooks

1. Create a new JSON file in `.kiro/hooks/` directory
2. Write configuration following the structure above
3. Save and Kiro will automatically load it

**Example**:

```json
{
  "name": "Run Tests After Code Change",
  "version": "1.0.0",
  "description": "Automatically run tests after code modification",
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

## 🚨 Important Notes

1. **Circular Dependencies**: preToolUse hooks may cause infinite loops, configure carefully
2. **Performance Impact**: postToolUse hooks trigger after every tool use, avoid time-consuming operations
3. **Permission Checks**: If hook output explicitly denies access, tool invocation will be blocked
4. **Timeout Settings**: Recommend setting timeout for runCommand type hooks to avoid blocking

---

## 🔄 Hook Lifecycle

```
User Action/Event Occurs
    ↓
Check for Matching Hooks
    ↓
Execute Hook Action
    ↓
  askAgent → Agent Processes Prompt → May Modify Code/Docs
  runCommand → Execute Command → Return Result
    ↓
Continue Original Flow
```

---

## 📊 Hook Optimization History

### v2.0 (2026-05-04)
- ✅ Merged 3 independent postToolUse hooks:
  - `validate-code-standards` (Code standards validation)
  - `sync-docs-with-implementation` (Documentation sync)
  - `check-gitignore` (Gitignore update)
- ✅ Added README update check functionality
- ✅ Unified as `post-write-quality-check` hook
- 🎯 Reduced redundancy, improved efficiency
- 📝 More comprehensive quality assurance

---

## 📚 Related Documentation

- [Development Rules](../../docs/development/rules.md)
- [Design Documents](../../docs/design/)
- [PRD](../../docs/PRD/PRD.md)
