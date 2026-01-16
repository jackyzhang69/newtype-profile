# Immi-OS 环境配置

环境配置文档，包含服务器访问规则、测试环境配置、ImmiCore 服务依赖。

---

## 项目类型

- **类型**: Claude Code 插件（TypeScript）
- **运行方式**: 本地开发，NPM 发布
- **服务依赖**: ImmiCore 后端服务

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Immi-OS 架构                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  本地 Mac (开发环境)               │  服务器 192.168.1.98                │
│  ├── 代码编辑 (VSCode/Cursor)      │  ├── ImmiCore 服务                 │
│  ├── Claude Code + Immi-OS 插件    │  │   ├── search-service :3104     │
│  ├── bun typecheck / bun test     │  │   ├── Caselaw MCP :3105         │
│  └── 本地无 Docker                 │  │   ├── Operation-manual :3107   │
│                                    │  │   ├── Help-centre :3109        │
│  环境变量指向服务器:                │  │   └── ES/Supabase/Neo4j        │
│  - HOST_URL=https://es_search...   │  └── (ImmiCore 常驻)               │
│  - AUDIT_KG_BASE_URL=https://...   │                                    │
└────────────────────────────────────┴────────────────────────────────────┘
```

---

## 服务器配置

| 项目 | 值 |
|------|-----|
| IP | `192.168.1.98` |
| 用户 | `jacky` |
| 密码 | `${SERVER_PASSWORD}` (见 `.env`) |
| SSH | `ssh jacky@192.168.1.98` |
| ImmiCore 目录 | `/home/jacky/immicore` |
| 系统 | Ubuntu Server |

**服务器角色**:
- 运行 ImmiCore 服务（search-service, MCP servers）
- 提供 Caselaw/KG/Operation-manual 等 API
- 本项目通过 HTTP 调用这些服务

---

## ⚠️ 服务器访问规则 (CRITICAL)

### 访问策略

| 策略 | 说明 |
|------|------|
| **只读访问** | Agent 只能通过 SSH 查看服务器状态、日志、配置 |
| **禁止修改** | 绝对不允许在服务器上执行任何写操作（文件修改、git、docker 操作等） |
| **修改方案** | 如需修改服务器内容，只能向用户提出修改方案，由用户决定执行 |

### 允许的操作

```bash
# 查看服务状态
ssh jacky@192.168.1.98 "docker ps"

# 查看日志
ssh jacky@192.168.1.98 "docker logs immicore-search-service-1 --tail 50"

# 查看配置（只读）
ssh jacky@192.168.1.98 "cat /home/jacky/immicore/.env"

# 健康检查
ssh jacky@192.168.1.98 "curl -s http://localhost:3104/health"
```

### 禁止的操作

```bash
# ❌ 修改文件
ssh jacky@192.168.1.98 "vim /home/jacky/immicore/.env"

# ❌ 重启服务
ssh jacky@192.168.1.98 "docker restart immicore-search-service-1"

# ❌ 部署/更新
ssh jacky@192.168.1.98 "cd /home/jacky/immicore && git pull"

# ❌ Docker 写操作
ssh jacky@192.168.1.98 "docker compose up -d"
```

---

## 环境变量

### 本地 `.env` 文件

```bash
# ImmiCore API（外网访问）
HOST_URL=https://es_search.jackyzhang.app/api/v1
AUDIT_KG_BASE_URL=https://es_search.jackyzhang.app/api/v1

# 认证 Token
SEARCH_SERVICE_TOKEN=<your_token>

# MCP 传输模式
AUDIT_MCP_TRANSPORT=http
AUDIT_MCP_HOST=https://es_search.jackyzhang.app

# ImmiCore 本地路径（stdio 模式）
IMMICORE_PATH=/Users/jacky/immicore
```

### 环境变量说明

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `HOST_URL` | ImmiCore API 地址 | `https://es_search.jackyzhang.app/api/v1` |
| `SEARCH_SERVICE_TOKEN` | 统一认证 Token | (见 `.env`) |
| `AUDIT_MCP_TRANSPORT` | MCP 传输模式 | `http` / `stdio` |
| `AUDIT_MCP_HOST` | MCP 服务主机 | `https://es_search.jackyzhang.app` |
| `AUDIT_KG_BASE_URL` | KG API 地址 | `https://es_search.jackyzhang.app/api/v1` |
| `IMMICORE_PATH` | ImmiCore 本地路径 | `/Users/jacky/immicore` |

---

## ImmiCore 服务依赖

### 服务端口映射

| 服务 | 端口 | 外网域名 | 用途 |
|------|------|----------|------|
| search-service | 3104 | `es_search.jackyzhang.app` | 主 API 服务 |
| caselaw MCP | 3105 | - | 案例法搜索 |
| email-kg MCP | 3106 | - | 邮件知识图谱 |
| operation-manual MCP | 3107 | - | IRCC 操作手册 |
| noc MCP | 3108 | - | NOC 职业分类 |
| help-centre MCP | 3109 | - | IRCC Help Centre |

### 外网访问

通过 Cloudflare Tunnel 暴露：

| 域名 | 服务 | 用途 |
|------|------|------|
| `es_search.jackyzhang.app` | search-service:3104 | API 服务（供 HTTP 模式调用） |

---

## 测试环境

### 测试命令

```bash
# 运行所有测试
bun test

# 运行特定测试文件
bun test src/audit-core/xxx.test.ts

# 类型检查
bun run typecheck

# 构建
bun run build
```

### 测试策略

| 类型 | 位置 | 说明 |
|------|------|------|
| 单元测试 | `*.test.ts` alongside source | 与源文件同目录 |
| 集成测试 | `tests/` | 需要 ImmiCore 服务 |
| E2E 测试 | `tests/e2e/` | 完整流程测试 |

### 测试前置条件

**本地测试（单元测试）**:
- 无需外部依赖
- 直接 `bun test`

**集成测试**:
- 需要配置 `.env` 中的 `SEARCH_SERVICE_TOKEN`
- 需要 ImmiCore 服务在线（`https://es_search.jackyzhang.app`）

### 测试风格

遵循 BDD 风格注释：

```typescript
describe('MyFeature', () => {
  it('should do something', () => {
    // #given
    const input = 'test'
    
    // #when
    const result = myFunction(input)
    
    // #then
    expect(result).toBe('expected')
  })
})
```

---

## 开发工作流

```
1. 本地编辑代码
       │
       ▼
2. 本地验证
   ├── bun run typecheck
   └── bun test
       │
       ▼
3. 提交代码
   └── git push origin dev
       │
       ▼
4. PR 合并到 main
       │
       ▼
5. GitHub Actions 发布到 npm
   └── gh workflow run publish -f bump=patch
```

### 禁止操作

- **本地** `bun publish` - 必须通过 CI
- **本地修改** `package.json` version - 由 CI 管理
- **直接部署**到服务器 - 本项目是插件，不部署到服务器

---

## 健康检查

### 验证 ImmiCore 服务

```bash
# 检查 search-service
curl -s https://es_search.jackyzhang.app/health

# 检查 Caselaw API
curl -s -X POST https://es_search.jackyzhang.app/api/v1/rag/keyword-caselaw-retrieve \
  -H "Authorization: Bearer $SEARCH_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "top_k": 1}'

# 运行内置健康检查
bun run src/audit-core/eval/health-check.ts
```

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 401 Unauthorized | Token 无效或过期 | 检查 `SEARCH_SERVICE_TOKEN` |
| 503 Service Unavailable | Ollama 未运行 | 服务器端问题，联系管理员 |
| Connection refused | 服务未启动 | 检查服务器状态 |
| 404 Not Found | 端点路径错误 | 检查 `HOST_URL` 配置 |

---

## 注意事项

1. **Token 安全**: `SEARCH_SERVICE_TOKEN` 在 `.env` 中，不提交 Git
2. **只读服务器**: Agent 绝对不能修改服务器内容
3. **外网优先**: 优先使用 `https://es_search.jackyzhang.app` 而非 `localhost`
4. **测试隔离**: 单元测试不依赖外部服务
