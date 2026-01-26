# RULE-006: Part-time / Gap Proactive Disclosure

> **类别**: academic (学术历史)
> **严重性**: medium
> **适用类型**: study
> **创建日期**: 2026-01-26
> **来源**: Immigration Lawyer Feedback - Practical Tip

## 规则描述

如果学习历史中存在 **Part-time 学期** 或 **学习空档 (Gap)**，应在学习计划中**主动披露并解释**，而不是试图隐藏或忽略。

签证官**会检查**成绩单和学习记录，如果发现未解释的异常会产生严重怀疑。

## 原理

1. **签证官会查**: 成绩单会显示每学期的学分数，Part-time 一目了然
2. **主动解释更好**: 坦诚解释比被发现后解释更可信
3. **影响 PGWP**: Part-time 学习历史可能影响毕业后工签资格
4. **诚信原则**: 隐瞒或误导比如实说明风险更大

## 触发条件 (Triggers)

当审计时检测到以下情况，应触发此规则：

```json
{
  "triggers": [
    "part-time semester",
    "兼职学期",
    "reduced course load",
    "减少课程",
    "academic gap",
    "学习空档",
    "leave of absence",
    "休学",
    "break in studies",
    "withdrew from courses",
    "dropped courses"
  ]
}
```

## 检测逻辑

```
IF transcript_shows_parttime OR study_history_has_gap THEN
  IF study_plan_does_not_address_it THEN
    WARNING: "Part-time/Gap 历史未在学习计划中解释"
    RECOMMENDATION: "应主动在学习计划中解释原因"
  END IF
END IF
```

## 需要解释的情况

| 情况 | 必须解释 | 解释重点 |
|------|----------|----------|
| Part-time 学期（非最后一学期） | ✅ 是 | 原因 + 如何追赶进度 |
| 休学 (Leave of Absence) | ✅ 是 | 原因 + 现在已恢复 |
| 延迟毕业 | ✅ 是 | 原因（学术困难/个人原因） |
| 转学导致的 Gap | ✅ 是 | 转学原因 + 时间线 |
| 最后一学期 Part-time | ⚠️ 可能 | 如果是因为剩余课程不足，可以不特别解释 |

## 可接受的解释理由

| 理由 | 可接受度 | 需要的支持文件 |
|------|----------|----------------|
| 医疗原因 | ✅ 高 | 医生证明（可选） |
| 家庭紧急情况 | ✅ 高 | 无需详细证明 |
| 经济困难（已解决） | ✅ 中 | 说明现在财务状况 |
| 学术调整需要 | ✅ 中 | 展示后续改善 |
| COVID-19 影响 | ✅ 高 | 2020-2022期间普遍接受 |
| 工作机会（与学习相关） | ⚠️ 中 | 需谨慎措辞 |
| 无明确原因 | ❌ 低 | 应尽量找到合理理由 |

## 学习计划中的解释模板

### Part-time 学期解释模板

```markdown
During the [Fall 2024 / specific semester], I took a reduced course load due to 
[specific reason: health issues / family emergency / financial adjustment]. 
This was a temporary situation that has since been fully resolved. I have 
subsequently returned to full-time studies and maintained [good academic 
standing / specific GPA] in the following semesters. This experience taught 
me [lesson learned] and I am now fully committed to completing my program 
on schedule.
```

### 休学解释模板

```markdown
I took a leave of absence from [start date] to [end date] due to [specific 
reason]. During this period, I [relevant activities: recovered, addressed 
family matters, etc.]. I returned to my studies on [return date] and have 
since [academic achievements]. This break, while unplanned, did not diminish 
my commitment to my education, and I am fully prepared to complete my 
upcoming program.
```

## 审计输出模板

当检测到 Part-time 或 Gap 历史时，在审计报告中加入：

```markdown
### ⚠️ 学术历史提醒: Part-time / Gap 披露

**发现**: 学习记录显示存在 [Part-time 学期 / 学习空档]:
- 时间: {period}
- 情况: {description}

**风险**: 
1. 签证官会检查成绩单，未解释的异常会引起怀疑
2. 可能影响"真实学生"(Genuine Student) 评估
3. 可能影响未来 PGWP 资格

**建议**: 
1. ✅ 在学习计划中**主动**、**简洁**地解释原因
2. ✅ 强调情况已解决，现在全力投入学习
3. ✅ 如有医疗原因，可准备证明（但不必过于详细）
4. ❌ **不要**试图隐藏或回避
5. ❌ **不要**过度解释或编造复杂故事

**措辞原则**:
- 坦诚但简洁
- 重点放在"已解决"和"未来计划"
- 不要道歉式语气
- 展示正面态度
```

## 与 PGWP 的关联提醒

如果申请人计划申请毕业后工签，应额外提醒：

```markdown
### ⚠️ PGWP 影响评估

由于学习历史中存在 Part-time/Gap 记录，可能影响未来 PGWP 申请资格：

| PGWP 要求 | 当前状况 | 风险评估 |
|-----------|----------|----------|
| 全日制学习 | 有 Part-time 记录 | ⚠️ 需要解释 |
| 连续学习 | {gap_days} 天空档 | ⚠️ 需要评估 |
| 150 天休学限制 | {leave_days} 天 | {risk_level} |

**建议**:
1. 保留所有 Part-time/Gap 的证明文件
2. 咨询学校确认是否影响 PGWP 资格
3. 如有医疗/COVID等合理原因，保留证据
```

## 参考资料

- IRCC Study Permit Assessment Guidelines
- PGWP Eligibility Requirements
- Federal Court: Disclosure vs Non-disclosure in Immigration Applications

## 相关规则

- RULE-003: Completion Date Buffer
- RULE-004: Employment Gap Filling
- Section 1.7: PGWP Full-time Requirements
