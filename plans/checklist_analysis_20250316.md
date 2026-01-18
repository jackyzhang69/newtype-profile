# 夫妻团聚申请材料清单生成逻辑分析与改进建议

## 1. 现有输出的缺陷分析

### 🔴 缺陷一：缺乏逻辑判断，导致材料冗余（"Kitchen Sink" 问题）
*   **现状**：系统把所有可能证明身份的文件都列为“必须”，没有做“OR”（或）的逻辑判断。
*   **事实**：对于加拿大公民担保人，根据 IRCC 指南，提供**加拿大公民证**或**加拿大护照**或**出生证明**（如果是本地出生）其中之一通常足以证明其担保资格。同时要求这三样不仅多余，还增加了客户的准备负担。
*   **逻辑缺失**：
    *   **子女监护权文件缺失**：案例中提到申请人带女儿来加拿大，但未提及孩子父亲。如果孩子父亲还在世且不随行，**必须**提供 IMM 5604（不随行父母同意书）和父亲的身份证件。
    *   **申请人婚姻史**：有孩子通常意味着有前婚史。清单只强调了担保人的离婚证，忽略了申请人可能需要的离婚证/前配偶死亡证明。

### 🔴 缺陷二：输出格式非结构化，难以二次处理
*   **现状**：Markdown 列表人眼可读，但机器不可读。冗长的文本描述混杂了“要求”和“建议”。
*   **需求**：JSON 格式是必须的，以实现数据与展示的分离。

### 🔴 缺陷三：表格“幻觉” (Hallucination)
*   **现状**：清单列出了 `IMM 0008 Schedule A` 到 `Schedule Z`，以及 `IMM 5533 Part A` 到 `Part CT`。
*   **事实**：这是严重的 AI 幻觉。IRCC 的表格是固定的（如 IMM 1344, IMM 5532）。不存在 Schedule Z 这种东西。

---

## 2. 改进方案：JSON 数据结构设计

建议的 JSON 结构示例，包含逻辑判断结果：

```json
{
  "application_meta": {
    "type": "spousal_sponsorship",
    "sponsor": "Wang Xiaoshuai",
    "principal_applicant": "Zhang Meili",
    "risk_level": "high"
  },
  "document_groups": [
    {
      "group_id": "sponsor_status",
      "group_name": "担保人资格证明",
      "logic": "ONE_OF", 
      "items": [
        {
          "id": "doc_sponsor_passport",
          "name": "加拿大护照",
          "required": true,
          "description": "有效期内的加拿大护照复印件"
        },
        {
          "id": "doc_sponsor_cit_cert",
          "name": "加拿大公民证书",
          "required": false,
          "description": "如无护照，需提供此文件"
        }
      ]
    },
    {
      "group_id": "child_custody",
      "group_name": "受抚养子女监护权",
      "logic": "MANDATORY_IF_APPLICABLE",
      "condition": "child_under_18_and_other_parent_non_accompanying",
      "items": [
        {
          "id": "imm5604",
          "name": "IMM 5604 不随行父母声明",
          "required": true,
          "description": "杨阳的生父必须签署此文件，并提供其身份证件复印件",
          "note": "针对中国申请人，通常需要公证处见证签名"
        }
      ]
    }
  ]
}
```

---

## 3. 系统改善建议

### A. 引入“规则引擎” (Rule Engine)
在 Prompt 或代码层引入规则判断：
*   `IF Sponsor = Citizen THEN Proof = Passport OR Cert`
*   `IF Applicant_Country = China THEN Add "Hukou (Household Register)"`
*   `IF Child_Age < 18 THEN Check "Other Parent Status"`

### B. 消除“表格幻觉”
建立真实的 IRCC 表格数据库（Knowledge Base），系统应从数据库中“检索”表格而非“生成”。

### C. 区分“法定必须”与“策略性建议”
*   **法定必须 (Mandatory)**：缺了直接退件（如结婚证）。
*   **策略性建议 (Strategic)**：应对高风险而建议（如解释信）。

### D. 本地化适配 (Localization)
针对中国申请人，自动提示“公证处 (Notary Public)”的要求（如出生公证、户口本公证）。
