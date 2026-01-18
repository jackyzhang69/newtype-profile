# 数据脱敏与影子案例架构 (Data Privacy & Shadow Case Architecture)

## 1. 核心理念

本项目采用 **"数据蒸馏" (Data Distillation)** 策略，将业务数据分离为两个生命周期完全不同的流向：
1.  **PII 区域 (热数据)**: 包含真实身份，服务于当次客户交付，生命周期短 (TTL=30天)。
2.  **Knowledge 区域 (冷数据)**: 仅包含逻辑特征和脱敏后的分析报告，服务于 AI 训练与长期能力迭代，永久保存。

## 2. 数据库架构设计

采用双表分离策略，确保物理层面的数据隔离。

### 2.1 PII 表 (短期保存)
存储所有敏感信息，设置自动过期时间。

```sql
-- table: applications_pii
create table applications_pii (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  full_name text,         -- 真实姓名 (PII)
  passport_number text,   -- 护照号 (PII)
  raw_documents_url text, -- 原始PDF路径 (PII)
  contact_info jsonb,     -- 电话、邮箱、住址 (PII)
  created_at timestamptz default now(),
  delete_at timestamptz default now() + interval '30 days' -- 设定死亡时间
);
```

### 2.2 案例知识库表 (永久保存 - AI 训练集)
存储脱敏后的逻辑特征和 AI 思维链。此表不应包含任何能反向推导出特定个人的信息。

```sql
-- table: case_knowledge_base
create table case_knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  pii_ref_id uuid, -- 仅用于短期关联，PII删除后保留此ID但查不到数据
  
  -- 逻辑特征 (AI 训练输入)
  -- 示例: { "age": 28, "country": "CN", "funds_range": "50k-100k", "education": "Master", "refusal_history": true }
  profile_features jsonb, 
  
  -- 分析结果 (AI 训练输出)
  audit_report_anonymized text, -- 脱敏后的报告文本 (替换人名为 APPLICANT_X)
  risk_factors jsonb,           -- 提取出的风险点
  reasoning_chain text,         -- AI 的 CoT (思维链)
  
  outcome_label text,           -- 人工复核结果 (如果有): "Pass", "Refuse"
  created_at timestamptz default now()
);
```

## 3. 运行时脱敏管道 (Runtime Pipeline)

在生成报告的同时，同步执行“影子案例”提取。

```typescript
// 伪代码示例
async function processApplication(input: RealUserData) {
  // 1. 正常业务：生成报告
  const auditResult = await auditAgent.analyze(input); // 包含PII的分析
  const fullReport = await reportBuilder.generatePDF(auditResult, input); // 给客户的

  // 2. 数据蒸馏：提取知识 (并行执行，不阻塞主流程)
  extractKnowledge(input, auditResult).catch(console.error);
  
  return fullReport;
}

async function extractKnowledge(input: RealUserData, result: AuditResult) {
  // 构建特征向量 (Feature Extraction)
  const features = {
    age: input.age, // 数字是安全的
    country_code: input.country, // 国家代码安全
    assets_level: getAssetRange(input.funds), // 模糊化资金: "50k-100k"
    study_plan_vector: await getEmbedding(input.study_plan) // 向量化学习计划
  };

  // 保存到永久知识库
  await supabase.from('case_knowledge_base').insert({
    profile_features: features,
    reasoning_chain: sanitizeText(result.thinking_process), // 确保思维链里没有名字
    audit_report_anonymized: sanitizeText(result.final_text)
  });
}
```

## 4. 自动化销毁机制 (The Reaper)

### 数据库清理
利用 pg_cron 或 Scheduled Function 每天运行清理任务。

```sql
SELECT cron.schedule('0 0 * * *', $$
  DELETE FROM applications_pii 
  WHERE delete_at < NOW();
$$);
```

### 文件存储清理
配置 Supabase Storage Bucket 的生命周期规则 (Lifecycle Rule)，设置 `Expiration: 30 days`。

## 5. 数据价值

该架构产生的 `case_knowledge_base` 可用于：
1.  **Few-Shot Prompting**: 检索相似的历史案例作为 AI 的参考上下文。
2.  **Fine-tuning**: 积累高质量的 [特征 -> 分析] 数据对，微调私有模型。
