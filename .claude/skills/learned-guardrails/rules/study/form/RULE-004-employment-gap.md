# RULE-004: Employment History Gap Filling

> **类别**: form (表格填写)
> **严重性**: medium
> **适用类型**: study
> **创建日期**: 2026-01-26
> **来源**: Immigration Lawyer Feedback - Practical Tip

## 规则描述

在填写就业历史时，**任何时间空档都应该用 "Full-time Student" 填补**，而不是留空。

留下未解释的时间空档会引起签证官的怀疑，可能导致额外的背景调查或拒签。

## 原理

1. **避免可疑空白**: 签证官会对未解释的时间段产生疑问
2. **学习也是"活动"**: 全日制学习是合法的活动，应该记录
3. **体现连续性**: 展示申请人一直有明确的活动轨迹
4. **减少补件请求**: 空白时间段可能导致 IRCC 要求补充解释

## 触发条件 (Triggers)

当审计时检测到以下情况，应触发此规则警告：

```json
{
  "triggers": [
    "employment gap",
    "时间空档",
    "unexplained gap",
    "未解释的空白",
    "gap in employment history",
    "就业历史空白",
    "no activity listed for period",
    "gap between jobs"
  ]
}
```

## 检测逻辑

```
FOR EACH period IN employment_history:
  IF next_period.start_date - period.end_date > 30 days THEN
    IF no_entry_for_gap THEN
      WARNING: "就业历史存在未解释的空档"
      RECOMMENDATION: "应使用 'Full-time Student' 或其他活动填补此空档"
    END IF
  END IF
END FOR
```

## 正确填写示例

### ❌ 错误做法 (有空白)

| 时间段 | 职位/活动 | 雇主/机构 |
|--------|-----------|-----------|
| 2022-09 至 2024-06 | Bachelor Student | ABC University |
| 2024-09 至 今 | Master Student | XYZ University |

**问题**: 2024-06 到 2024-09 之间有 3 个月空白未解释。

### ✅ 正确做法 (无空白)

| 时间段 | 职位/活动 | 雇主/机构 |
|--------|-----------|-----------|
| 2022-09 至 2024-06 | Bachelor Student | ABC University |
| 2024-06 至 2024-09 | Full-time Student (Graduation Preparation) | ABC University |
| 2024-09 至 今 | Master Student | XYZ University |

**或者使用**:
- "Job Search / Career Transition"
- "Language Study" (如果有语言学习)
- "Volunteer Work" (如果有志愿服务)
- "Family Responsibility" (如有合理家庭原因)

## 常见空档场景及填写建议

| 空档原因 | 建议填写 | 备注 |
|----------|----------|------|
| 毕业到入学之间 | Full-time Student (Graduation/Orientation) | 可解释为准备阶段 |
| 找工作期间 | Job Search / Career Planning | 诚实但不突出 |
| 语言学习 | Language Training Program | 如实填写 |
| 旅行 | Personal Travel | 不超过 3 个月为佳 |
| 家庭责任 | Family Responsibility / Caregiver | 如确实如此 |
| 健康原因 | Medical Leave | 可能需要证明 |

## 审计输出模板

当检测到就业历史空档时，在审计报告中加入：

```markdown
### ⚠️ 表格填写建议: 就业历史空档

**发现**: 就业历史中存在 {gap_start} 至 {gap_end} 期间（约 {gap_days} 天）的未解释空白。

**风险**: 签证官可能对此时间段产生疑问，导致额外审查或补件请求。

**建议**: 
1. 使用适当的活动描述填补此空白
2. 如果该期间正在学习，使用 "Full-time Student"
3. 如果该期间在准备申请/过渡，使用 "Career Transition / Application Preparation"

**可接受的填写选项**:
- Full-time Student
- Job Search / Career Planning  
- Language Training
- Personal/Family Responsibility
```

## 特殊注意事项

### 中国申请人常见情况

1. **高考复读**: 可填写 "High School Student (Exam Preparation)"
2. **大学延迟入学**: 可填写 "University Admission Preparation"
3. **Gap Year**: 需要合理解释活动内容

### 与其他规则的关联

- 如果空档与 Part-time/Gap 学习历史相关，同时参考 RULE-006
- 如果涉及境内申请的身份过渡，参考 R215 分类规则

## 参考资料

- IRCC Application Guide: Employment History Section
- Common reasons for additional document requests

## 相关规则

- RULE-003: Completion Date Buffer
- RULE-006: Part-time/Gap Disclosure
