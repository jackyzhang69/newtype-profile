# Server URL Configuration

所有服务连接遵循同一规则：**先尝试局域IP (192.168.1.98:PORT)，不行就用公网 (从 AUDIT_KG_BASE_URL 提取域名:PORT)**

## 服务端口

| 服务 | 端口 | 局域IP | 公网 |
|------|------|--------|------|
| file-content | 3104 | `http://192.168.1.98:3104/api/v1` | `https://es_search.jackyzhang.app:3104/api/v1` |
| caselaw | 3105 | `http://192.168.1.98:3105/api/v1` | `https://es_search.jackyzhang.app:3105/api/v1` |
| operation-manual | 3107 | `http://192.168.1.98:3107/api/v1` | `https://es_search.jackyzhang.app:3107/api/v1` |
| help-centre | 3109 | `http://192.168.1.98:3109/api/v1` | `https://es_search.jackyzhang.app:3109/api/v1` |

## 实现

所有服务客户端类必须实现 fallback 机制：先尝试局域IP，失败时自动降级到公网。参考 `src/audit-core/file-content/client.ts` 中的 `fetchWithFallback()` 实现。
