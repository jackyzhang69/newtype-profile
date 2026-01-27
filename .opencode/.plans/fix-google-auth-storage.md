# Fix Google Auth Storage Path Mismatch

## Problem

Google Auth 失败：存储路径不匹配

| 问题 | 代码期望 | 实际位置 |
|------|----------|----------|
| 目录 | `~/.local/share/opencode/` | `~/.config/opencode/` |
| 文件名 | `oh-my-opencode-accounts.json` | `antigravity-accounts.json` |
| Schema | version 1 | version 3 |

## Solution

修改 `storage.ts`：更正路径 + 添加 v3→v1 迁移

---

## Files to Modify

### 1. `src/auth/antigravity/storage.ts`

1. **更新 import 和路径函数**
```typescript
// Before
import { getDataDir as getSharedDataDir } from "../../shared/data-path"
export function getDataDir(): string { ... }
export function getStoragePath(): string { ... }

// After
import { getUserConfigDir } from "../../shared/config-path"
import { homedir } from "node:os"
export function getStorageDir(): string {
  return join(getUserConfigDir(), "opencode")
}
export function getStoragePath(): string {
  return join(getStorageDir(), "antigravity-accounts.json")
}
export function getLegacyStoragePath(): string {
  const dataDir = process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share")
  return join(dataDir, "opencode", "oh-my-opencode-accounts.json")
}
```

2. **添加 v3 迁移函数**
```typescript
function migrateV3ToV1(data: unknown): AccountStorage | null {
  // Convert rateLimitResetTimes → rateLimits
  // Default tier = "free"
  // Handle missing fields
}
```

3. **更新 loadAccounts() 尝试多路径**

### 2. `src/auth/antigravity/storage.test.ts`

- 更新路径 assertions 到 `~/.config/opencode/`
- 添加迁移测试

---

## Verification

```bash
bun test src/auth/antigravity/storage.test.ts
```

手动验证：启动 opencode，确认 Google auth 正常工作

## Constraints

- 不修改 `src/audit-core/` - audit-manager 不受影响
- 不删除旧文件 - 只读取和迁移
