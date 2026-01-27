# 快速开始 - 文件提取服务测试

## 服务端测试运行

### 环境准备
```bash
cd /Users/jacky/immicore/services

# 安装依赖
pip install -r requirements-dev.txt
# 需要: pytest, pytest-cov, pytest-asyncio, pytest-timeout, redis, fakeredis

# 启动 Redis (如果需要)
redis-server &
```

### 运行完整测试套件（推荐）
```bash
# 运行所有测试，并生成 100% 覆盖率报告
pytest --cov=src/services/file_content \
        --cov-fail-under=100 \
        --cov-report=term-missing \
        --cov-report=html \
        -v
```

### 按优先级运行
```bash
# P0 - 防止已知问题 (快速，~1分钟)
pytest tests/file_content/unit/test_task_manager_edge_cases.py -v

# P1 - 核心功能 (中等，~2分钟)
pytest tests/file_content/unit/test_loader_edge_cases.py -v

# P2 - 容错恢复 (中等，~2分钟)
pytest tests/file_content/unit/test_tasks_fault_tolerance.py -v

# P3 - 性能并发 (较慢，~5分钟)
pytest tests/file_content/unit/test_performance_benchmarks.py -v

# 压缩文件测试 (中等，~2分钟)
pytest tests/file_content/extractors/test_archive_extractor.py -v
```

### 按类别运行
```bash
# 只运行单元测试 (快速)
pytest tests/file_content/unit -v -m "not slow"

# 只运行提取器测试
pytest tests/file_content/extractors -v

# 生成覆盖率报告 (HTML)
pytest --cov=src/services/file_content --cov-report=html
# 打开: htmlcov/index.html
```

### 运行特定测试
```bash
# 单个测试
pytest tests/file_content/unit/test_task_manager_edge_cases.py::TestNoneValueHandling::test_metadata_with_none_page_count -v

# 匹配名称的所有测试
pytest -k "test_zip" -v

# 显示详细输出
pytest tests/file_content/ -vv -s
```

---

## 客户端测试运行 (immi-os)

### 环境准备
```bash
cd /Users/jacky/immi-os

# 确保安装了 vitest 和依赖
bun install
# 或
npm install --save-dev vitest
```

### 运行集成测试
```bash
# 运行客户端集成测试
bun test src/audit-core/file-content/client.integration.test.ts

# 或使用 npm
npm test src/audit-core/file-content/client.integration.test.ts
```

### 运行压力测试
```bash
# 运行客户端压力测试
bun test src/audit-core/file-content/client.stress.test.ts
```

### 运行所有文件内容测试
```bash
bun test src/audit-core/file-content/
```

---

## 测试覆盖率验证

### 查看覆盖率报告
```bash
cd /Users/jacky/immicore/services

# 生成 HTML 报告
pytest --cov=src/services/file_content --cov-report=html

# 打开报告
open htmlcov/index.html  # macOS
# 或
xdg-open htmlcov/index.html  # Linux
```

### 覆盖率检查
```bash
# 验证覆盖率 >= 100%
pytest --cov=src/services/file_content --cov-fail-under=100 -v

# 显示缺失的行
pytest --cov=src/services/file_content --cov-report=term-missing
```

---

## 常见问题排查

### 测试发现失败
```bash
# 验证测试文件位置
find tests/file_content -name "test_*.py" -type f

# 运行测试发现
pytest --collect-only tests/file_content/
```

### 导入错误
```bash
# 验证 Python 路径
python -c "import sys; print(sys.path)"

# 确保在服务目录
cd /Users/jacky/immicore/services
export PYTHONPATH="${PWD}/src:${PYTHONPATH}"
```

### Redis 连接错误
```bash
# 检查 Redis 运行状态
redis-cli ping  # 应该返回 PONG

# 或使用 fakeredis (无需真实 Redis)
# conftest.py 中提供了 mock_redis fixture
```

### 异步测试失败
```bash
# 确保 pytest-asyncio 安装
pip install pytest-asyncio

# 在 pytest.ini 中配置
asyncio_mode = auto
```

---

## 测试结构

```
immicore/services/
├── src/services/file_content/
│   ├── extractors/
│   │   └── archive_extractor.py          # ← 新增
│   ├── models.py                          # ← 修改
│   └── loader.py                          # ← 修改
│
├── tests/file_content/
│   ├── conftest.py                        # ← 新增 (共享 fixtures)
│   ├── extractors/
│   │   └── test_archive_extractor.py      # ← 新增 (15 个测试)
│   │
│   └── unit/
│       ├── test_task_manager_edge_cases.py     # ← 新增 (P0: 12 个)
│       ├── test_loader_edge_cases.py           # ← 新增 (P1: 33 个)
│       ├── test_tasks_fault_tolerance.py       # ← 新增 (P2: 25 个)
│       └── test_performance_benchmarks.py      # ← 新增 (P3: 36 个)
│
├── .coveragerc                            # ← 新增
├── pytest.ini                             # ← 新增
└── .github/workflows/test-coverage.yml    # ← 新增

immi-os/
├── src/audit-core/file-content/
│   ├── client.integration.test.ts         # ← 新增 (~300 行)
│   └── client.stress.test.ts              # ← 新增 (~400 行)
└── IMPLEMENTATION_SUMMARY.md              # ← 新增
```

---

## 性能基准

运行性能测试查看基准:
```bash
pytest tests/file_content/unit/test_performance_benchmarks.py::TestPerformanceBaselines -v
```

**预期结果**:
- 单文件提取: < 100ms
- 10文件批次: < 500ms
- 100文件批次: < 5 秒
- 100并发任务: < 30 秒
- 格式检测 (1000文件): < 1 秒
- 哈希计算 (1MB): < 1 秒

---

## CI/CD 集成

### 本地运行 CI 流程
```bash
cd /Users/jacky/immicore/services

# 1. 单元 + 集成 + 压力测试
pytest tests/file_content/ -v --cov --cov-fail-under=100

# 2. 类型检查
mypy src/services/file_content --strict

# 3. 代码风格
black --check src/services/file_content tests/file_content
isort --check-only src/services/file_content tests/file_content
flake8 src/services/file_content
```

### GitHub Actions
```bash
# 提交代码时自动运行
git push origin feature-archive-extractor

# 查看 CI 状态
# → Actions 标签页中查看 "File Content Service Tests & Coverage"
```

---

## 测试统计

### 总体覆盖
- **总测试用例**: 170+
- **目标覆盖率**: 100%
- **代码行数**: 3,230+

### 分布
| 类别 | 用例数 | 耗时 |
|------|------|------|
| P0 防护 | 12 | 1 分钟 |
| P1 功能 | 33 | 2 分钟 |
| P2 容错 | 25 | 2 分钟 |
| P3 性能 | 36 | 5 分钟 |
| 压缩文件 | 15 | 2 分钟 |
| 客户端 | 50+ | 3 分钟 |
| **总计** | **170+** | **15 分钟** |

---

## 打印输出说明

### 覆盖率不足时
```
FAILED: Coverage check failed:
Expected: 100%
Actual: 98%
Missing coverage: src/services/file_content/extractors/archive_extractor.py:450-460
```

**解决**: 运行 `--cov-report=term-missing` 查看缺失行

### 异步测试超时时
```
FAILED: test_concurrent_extractions - asyncio timeout
```

**解决**: 增加 `timeout` 或调整异步操作时间

### 类型检查失败时
```
error: Argument of type "None" cannot be assigned to parameter
```

**解决**: 添加类型保护或使用 `Optional[]` 注解

---

## 调试技巧

### 运行单个测试，显示详细输出
```bash
pytest tests/file_content/unit/test_task_manager_edge_cases.py::TestNoneValueHandling::test_metadata_with_none_page_count -vv -s
```

### 在测试中添加调试
```python
def test_example():
    result = some_function()
    print(f"DEBUG: result = {result}")  # 使用 -s 显示
    assert result is not None
```

### 使用 pdb 调试
```python
def test_example():
    result = some_function()
    breakpoint()  # 中断点
    assert result is not None
```

```bash
pytest tests/file_content/ --pdb  # 在失败时进入调试器
```

### 显示最慢的测试
```bash
pytest tests/file_content/ --durations=10
```

---

## 清理和维护

### 清理临时文件
```bash
# 删除缓存
find tests/file_content -type d -name __pycache__ -exec rm -rf {} +
find tests/file_content -type f -name "*.pyc" -delete

# 删除覆盖率报告
rm -rf htmlcov .coverage coverage.xml

# 删除虚拟环境中的旧缓存
pip cache purge
```

### 更新依赖
```bash
pip install --upgrade pytest pytest-cov pytest-asyncio pytest-timeout
```

---

## 相关文档

- 实现总结: `/Users/jacky/immi-os/IMPLEMENTATION_SUMMARY.md`
- 项目规范: `/Users/jacky/immi-os/CLAUDE.md` (压缩文件提取规则)
- 代码规范: `docs/agent-guides/framework/coding-standards.md`
- 测试指南: `docs/agent-guides/framework/testing.md` (如果存在)

---

## 获取帮助

### 查看测试帮助
```bash
pytest --help | grep -E "(cov|mark|timeout|asyncio)"
```

### 查看覆盖率报告详情
```bash
pytest --cov=src/services/file_content --cov-report=json
# 查看 coverage.json 分析
```

### 联系开发
- 提问: 查看 `/Users/jacky/immi-os/IMPLEMENTATION_SUMMARY.md`
- Bug 报告: GitHub Issues
- 反馈: Pull Requests
