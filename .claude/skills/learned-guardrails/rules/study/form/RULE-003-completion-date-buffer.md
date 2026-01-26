# RULE-003: Completion Date Buffer (+90 Days)

> **类别**: form (表格填写)
> **严重性**: medium
> **适用类型**: study
> **创建日期**: 2026-01-26
> **来源**: Immigration Lawyer Feedback - Practical Tip

## 规则描述

学习许可申请表中填写的 **Expected Completion Date（预计完成日期）** 应比 LOA 上的项目结束日期 **多加至少 90 天** 缓冲时间。

## 原理

1. **论文/最终项目**: 很多学生需要额外时间完成毕业论文或 capstone project
2. **期末考试/补考**: 可能有补考或延期考试
3. **行政处理时间**: 成绩发布、毕业证办理需要时间
4. **避免身份问题**: 如果项目实际完成时间晚于学签到期，会造成身份问题

## 触发条件 (Triggers)

当审计时检测到以下情况，应触发此规则警告：

```json
{
  "triggers": [
    "expected completion date equals LOA end date",
    "预计完成日期等于项目结束日期",
    "completion date same as program end",
    "no buffer on completion date",
    "学签到期日与项目结束日相同"
  ]
}
```

## 检测逻辑

```
IF expected_completion_date <= program_end_date THEN
  WARNING: "预计完成日期缺少缓冲"
  RECOMMENDATION: "建议将预计完成日期设为项目结束日期 + 90 天"
END IF
```

## 正确做法

| LOA 项目结束日期 | 表格填写日期 | 缓冲天数 |
|------------------|--------------|----------|
| 2026-04-30 | 2026-07-31 | +92 天 ✅ |
| 2026-12-15 | 2027-03-15 | +90 天 ✅ |
| 2027-08-31 | 2027-08-31 | +0 天 ❌ |

## 错误示例

❌ **错误做法**:
```
LOA 项目结束: 2026-04-30
表格填写: 2026-04-30 (与 LOA 完全一致)
```

**风险**: 如果需要额外几周完成论文答辩，学签可能在完成学业前过期。

✅ **正确做法**:
```
LOA 项目结束: 2026-04-30
表格填写: 2026-07-31 (加 3 个月缓冲)
```

## 审计输出模板

当检测到此问题时，在审计报告中加入：

```markdown
### ⚠️ 表格填写建议: 预计完成日期

**发现**: 表格中的预计完成日期 ({detected_date}) 与 LOA 项目结束日期 ({loa_end_date}) 相同或过近。

**风险**: 如果项目实际完成时间晚于预期，可能导致学签过期前无法完成学业。

**建议**: 将预计完成日期设为 **{recommended_date}**（项目结束日期 + 90 天）。

**理由**:
- 留出毕业论文/项目答辩时间
- 考虑期末考试/补考可能
- 预留行政处理时间
```

## 参考资料

- IRCC Study Permit Processing Guidelines
- Federal Court: Adequate time for program completion is a reasonable consideration

## 相关规则

- RULE-004: Employment Gap Filling
- R215 Classification Rules
