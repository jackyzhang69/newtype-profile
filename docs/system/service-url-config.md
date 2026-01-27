# Service URL Configuration

统一的服务 URL 配置管理系统，消除硬编码，提供自动 fallback 机制。

---

## 设计原则

### 问题

之前的代码中，`localhost:3104` 硬编码在多个文件中：
- `src/audit-core/file-content/client.ts`
- `src/audit-core/http-client.ts`
- `src/audit-core/eval/health-check.ts`

这导致：
1. 配置分散，难以维护
2. 本地开发时无法访问远程服务
3. 修改配置需要改多个文件

### 解决方案

创建统一的配置模块 `src/audit-core/config/service-urls.ts`，提供：
1. 集中式配置管理
2. 自动 fallback 链
3. 环境变量优先级
4. 类型安全的服务名称

---

## 配置结构

### 服务器配置

```typescript
export const SERVER_CONFIG = {
  LAN_IP: "192.168.1.98",
  PUBLIC_DOMAIN: "es_search.jackyzhang.app",
  API_PATH: "/api/v1",
}
```

### 服务端口

```typescript
export const SERVICE_PORTS = {
  FILE_CONTENT: 3104,
  CASELAW: 3105,
  EMAIL_KG: 3106,
  OPERATION_MANUAL: 3107,
  NOC: 3108,
  HELP_CENTRE: 3109,
}
```

### 服务配置

```typescript
export const SERVICE_CONFIGS = {
  fileContent: {
    name: "File Content Extraction",
    port: 3104,
    envVar: "FILE_CONTENT_BASE_URL",
    lanIp: "192.168.1.98",
    publicDomain: "es_search.jackyzhang.app",
    apiPath: "/api/v1",
  },
  knowledgeGraph: {
    name: "Knowledge Graph API",
    port: 3104,
    envVar: "AUDIT_KG_BASE_URL",
    lanIp: "192.168.1.98",
    publicDomain: "es_search.jackyzhang.app",
    apiPath: "/api/v1",
  },
  // ... 其他服务
}
```

---

## URL 优先级

### Fallback 链

对于每个服务，URL 解析按以下优先级：

```
1. 环境变量（如果配置）
   ↓ 失败
2. 局域网 IP (http://192.168.1.98:PORT/api/v1)
   ↓ 失败
3. 公网域名 HTTPS (https://es_search.jackyzhang.app:PORT/api/v1)
   ↓ 失败
4. 公网域名 HTTP (http://es_search.jackyzhang.app:PORT/api/v1)
```

### 示例

**File Content Service**:
```typescript
const urls = resolveServiceUrls("fileContent")
// 返回:
// [
//   "http://192.168.1.98:3104/api/v1",           // LAN (优先)
//   "https://es_search.jackyzhang.app:3104/api/v1", // Public HTTPS
//   "http://es_search.jackyzhang.app:3104/api/v1"   // Public HTTP
// ]
```

**如果设置了环境变量**:
```bash
export FILE_CONTENT_BASE_URL=http://custom:3104/api/v1
```

```typescript
const urls = resolveServiceUrls("fileContent")
// 返回:
// [
//   "http://custom:3104/api/v1",                 // ENV (最优先)
//   "http://192.168.1.98:3104/api/v1",           // LAN
//   "https://es_search.jackyzhang.app:3104/api/v1", // Public HTTPS
//   "http://es_search.jackyzhang.app:3104/api/v1"   // Public HTTP
// ]
```

---

## API 使用

### 获取单个 URL

```typescript
import { getServiceUrl } from "@/audit-core/config"

const url = getServiceUrl("fileContent")
// 返回: "http://192.168.1.98:3104/api/v1"
```

### 获取 Fallback 列表

```typescript
import { getServiceUrlsWithFallback } from "@/audit-core/config"

const urls = getServiceUrlsWithFallback("fileContent")
// 返回: ["http://192.168.1.98:3104/api/v1", "https://...", "http://..."]

for (const url of urls) {
  try {
    const result = await fetch(`${url}/health`)
    if (result.ok) {
      console.log(`✅ Connected to ${url}`)
      break
    }
  } catch (error) {
    console.warn(`⚠️ Failed ${url}`)
  }
}
```

### 支持的服务名称

```typescript
type ServiceName = 
  | "fileContent"
  | "knowledgeGraph"
  | "caselaw"
  | "operationManual"
  | "helpCentre"
```

---

## 环境变量

### 可选配置

| 环境变量 | 用途 | 示例 |
|---------|------|------|
| `FILE_CONTENT_BASE_URL` | 覆盖 File Content 服务 URL | `http://custom:3104/api/v1` |
| `AUDIT_KG_BASE_URL` | 覆盖 Knowledge Graph API URL | `https://kg.example.com/api/v1` |

### 不需要配置

如果不设置环境变量，系统会自动使用 fallback 链：
1. 先尝试局域网 IP (192.168.1.98)
2. 再尝试公网域名 (es_search.jackyzhang.app)

---

## 迁移指南

### 旧代码

```typescript
const baseUrl = process.env.AUDIT_KG_BASE_URL || "http://localhost:3104/api/v1"
```

### 新代码

```typescript
import { getServiceUrl } from "@/audit-core/config"

const baseUrl = getServiceUrl("knowledgeGraph")
```

### 优势

1. **消除硬编码**: 不再有 `localhost:3104` 硬编码
2. **自动 fallback**: 自动尝试 LAN -> Public
3. **类型安全**: TypeScript 检查服务名称
4. **集中管理**: 修改配置只需改一个文件

---

## 测试

运行测试：

```bash
bun test src/audit-core/config/service-urls.test.ts
```

测试覆盖：
- ✅ 默认配置（无环境变量）
- ✅ 环境变量优先级
- ✅ Fallback 链顺序
- ✅ 尾部斜杠处理
- ✅ 无公网域名的服务

---

## 添加新服务

### 步骤

1. 在 `SERVICE_PORTS` 中添加端口：

```typescript
export const SERVICE_PORTS = {
  // ... 现有服务
  NEW_SERVICE: 3110,
}
```

2. 在 `SERVICE_CONFIGS` 中添加配置：

```typescript
export const SERVICE_CONFIGS = {
  // ... 现有服务
  newService: {
    name: "New Service",
    port: SERVICE_PORTS.NEW_SERVICE,
    envVar: "NEW_SERVICE_BASE_URL", // 可选
    lanIp: SERVER_CONFIG.LAN_IP,
    publicDomain: SERVER_CONFIG.PUBLIC_DOMAIN, // 可选
    apiPath: SERVER_CONFIG.API_PATH,
  },
}
```

3. 使用：

```typescript
const url = getServiceUrl("newService")
```

---

## 注意事项

### SSH 健康检查

以下代码中的 `localhost:3104` 是**正确的**，不需要修改：

```bash
ssh jacky@192.168.1.98 "curl -s http://localhost:3104/health"
```

原因：这是在服务器内部执行，访问服务器本地的 3104 端口。

### 文档示例

文档中的配置示例应该使用：
- 开发环境：`http://192.168.1.98:3104/api/v1`
- 生产环境：`https://es_search.jackyzhang.app/api/v1`

不再使用 `localhost:3104`。

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `src/audit-core/config/service-urls.ts` | 核心配置模块 |
| `src/audit-core/config/index.ts` | 导出接口 |
| `src/audit-core/config/service-urls.test.ts` | 测试文件 |
| `src/audit-core/file-content/client.ts` | 使用示例 |
| `docs/system/environment.md` | 环境配置文档 |
| `docs/system/server.md` | 服务器配置文档 |
