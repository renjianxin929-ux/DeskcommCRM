# ZH-CN 残留葡萄牙语审计

分支 `feat/zh-cn-complete`。本阶段开始时已 fast-forward 推送 `fb84f3875..3117c3770`。下面的 P0 修改还在工作区，没有提交，也没有再次推送。

前提仍成立：zh-CN 字典缺键 = 0。本轮不再按缺键补字典。新键只加在硬编码句子进入 `traduzir` / `copiar` 的地方。葡萄牙语源句仍是字典键，没有改成中文。

## 测量

「用户可见葡萄牙语 = 0」指下面这组 **zh-CN 渲染结果** 里，葡萄牙语拼写为 0。测量在 `tests/unit/i18n-residual-zh.test.ts`：

- 邀请邮件（subject / html / text）
- GoTrue 确认信与恢复信（产品默认语言 zh-CN）
- LGPD PDF 固定标签（含无本地数据、未签名警告、页脚）
- 外发退订脚
- 活动 `{{saudacao}}` 的早、午、晚
- `extensoes/pacotes/deskcomm/` 三个包里每一个带 `pt-BR` 的展示字段，经 `localize(..., "zh-CN")`
- 案例讨论助手的产品说明句

检测是重音字母，加上 `não`、`você`、`relatório`、`convidou`、`senha`、`Bom dia` 这类若回退到葡语原句就会出现的词。`LGPD`、`PAdES`、`DPO`、`STOP`、`CPF` 不记为葡萄牙语正文。

同一测试还锁住：扩展 zh-CN 不回退；退订脚使用 `STOP`；省略语言时问候仍是 `Bom dia`；案例助手的中文规则加在 system 末尾，pt-BR 路径与省略路径字节相同；新智能体默认提示不再写「em português do Brasil」。

P1 和 ACCEPTABLE 不在这组渲染里，所以不把它们算进 0。它们列在下面，没有当成已修。

屏幕铬层另有既有门禁：`i18n-espanhol-cobre-a-tela` 扫 `app/` 与 `components/` 里未进入 `t()` 的葡语，`i18n-chines-completo` 要求每个字典键都有非空 zh-CN。那两道门禁本轮通过，量的是字典，不是本文件的残留。

## P0 — 阻塞「所有界面中文」（已修）

### 1. 扩展 manifest / metadata

`LocalizedText` 增加可选 `zh-CN`。schema 仍是 `.strict()`。`localize()` 在 `zh-cn` / `zh` 且字段非空时返回简体中文，否则才回退葡语。不把 `zh-TW` 映到简体。

三个已发布包的 title、summary、卡片标题、说明、小标题、正文、动作标签都写了简体中文，不是葡语复制。目录由 `scripts/gerar-catalogo-de-extensoes.ts` 重算，修订为 2。`mirrorsCatalog` 同时比较 title 与 summary 的 zh-CN。

缺 zh-CN 的第三方包仍回退葡语，并显示已有的「目前只有葡萄牙语」警告。那是回退说明，不是用葡语充数。

### 2. TokenCounter

`tokens`、`próximo do limite`、`acima do limite` 走 `tr()`。数字仍用 `useTagDeIdioma()`。`tokens` 的中文值保持 `tokens`（计量单位，不是句子）。

### 3. 没有 IdiomaProvider 的用户可见组件

没有把葡语源码改成中文。`IDIOMA_SEM_ARVORE` 仍是 `pt-BR`，片段和测试继续看到葡语键。产品布局本来就包着 `IdiomaProvider`，或在服务端走 `idiomaDoVisitante` + `traduzir`。

法律页正文已是服务端 `traduzir`。条款与隐私的浏览器标题从静态 `metadata` 改为 `generateMetadata`，跟访问者语言。

### 4. 用户可见邮件

| 邮件 | zh-CN 怎么来 |
| --- | --- |
| 团队邀请 | 调用方读取组织 `locale`，传入 `buildInviteEmail`。查询失败保持 pt-BR，避免把发送失败误报成语言切换。角色 wire 值映射到已有标签：admin / manager / agent / viewer。 |
| 认证确认、密码恢复 | `app/email-templates/[modelo]` 把 `IDIOMA_PADRAO`（zh-CN）交给 `montarTemplateDeAcesso`。省略参数时函数默认仍是 pt-BR，既有单测不变。`{{ .RedirectTo }}` 与 `{{ .TokenHash }}` 保持不转义。 |
| LGPD 导出完成 | `sendExportEmail` 接受组织语言。 |
| LGPD SLA 告警 | 发送前读组织语言。请求类型和状态的 wire 值不翻译。 |

日期格式用读者的 locale，时区仍是 `America/Sao_Paulo`。

### 5. LGPD PDF

固定标题、状态、同意、页脚、PAdES 警告走 `t()` / `copiar`。省略 `idioma` 时默认 pt-BR，既有「Controlador:」快照仍成立。

不翻译：消息正文、状态枚举原文、`time_zone`、`lei_citada`、`legal_name`、证件字段名。工人按组织语言渲染。

### 6. 退订脚与公开页

zh-CN 外发脚为「如果不想再收到这些消息，请单独回复 STOP。」`STOP` 已在检测词表里。未知语言（含空值、`de-DE`）仍落回葡语 `PARAR`，既有测试锁着这条，没有改成中文。

没有另找独立的退订网页。公开法律页见第 3 项。

### 7. 预算 / 校验里进入界面的固定句

预算路由里已经进字典的拒绝句继续走 `traduzir`。本项里真正绕过字典、又会稳定出现在界面上的，是扩展文案和 TokenCounter，已在第 1、2 项修完。预算金额的 `pt-BR` 数字格式见 P1，没有改。

### 8. 案例讨论助手

产品说明的 zh-CN 从「并用葡萄牙语说明」改为「并用简体中文说明」。葡语键不变。

运行时 `montarSystem` 仅在 zh-CN 或 es 时于 system **末尾**追加语言规则，覆盖人设里可能残留的葡语要求。pt-BR 和省略参数不追加，`contexto.test.ts` 的整段字符串比较保持不变。聊天路由传入 `authz.user.idioma`。

数据块标签（「o que a equipe já decidiu」等）仍是葡语，给模型当上下文，不直接画在界面上。中文规则在最后。

新建智能体的默认 `system_prompt`，以及客户开发智能体的第一句，改为跟随 `{{contact_locale}}`，未设置时用组织语言。已保存在库里的旧提示不改写。

图片描述提示按组织语言生成（zh-CN 为简体中文，es 为西班牙语，其余保持原来的葡语句）。

### 9. KPI 与已持久化的日期句子

KPI 告警在 GET 时用平台管理员的 `user_metadata.locale` 拼文案，并用对应日期 locale。这些句子不落库。`status_reason` 保持原始数据。

停滞案例和「跟进未绑定智能体」的 **今后** 收件箱标题/正文按组织语言写入。已经写进库的行不改写。测试桩把 `organizations.locale` 设为 `pt-BR`，原有葡语断言保持绿色。

### 10. 界面语言与币种

`lib/money.ts` 未改。`formatCents` 按货币代码选格式，不按界面语言。详见 ACCEPTABLE 与 P1。

## P1 — 阻塞「中国版完整体验」（本轮不修）

这些会在特定路径上仍以葡语或巴西数字习惯出现。它们不在上面的渲染测量里。

1. **GoTrue 每安装只有一个模板。** 路由按产品默认语言 zh-CN 输出。同一安装里的 pt-BR 用户也会收到中文认证信。GoTrue 取模板时没有收件人，做不到按人切换。
2. **静态认证模板仍是葡语。** `supabase/templates/confirmation.html`、`recovery.html`，以及 `supabase/config.toml` 的主题句。安装器的 `marca-emails.sh` 也是这条旁路。正式安装把 GoTrue 指到 HTTP 路由。本轮按要求不中文化安装器 CLI。
3. **`organizations.locale` 的 SQL 默认值仍是 `pt-BR`。** 引导脚本和安装器会写入 `APP_LOCALE`（本 fork 默认 zh-CN）。省略该列的其他插入仍会得到葡语。没有做迁移。`organizations.timezone` 默认 `America/Sao_Paulo`，引导脚本不改它。
4. **无人调用的预算告警邮件** `lib/email/templates/ai-budget-alarm.tsx` 仍是葡语，并用 `pt-BR` 格式写美元。当前没有发送方。
5. **美元金额的巴西分组。** `formatCentsUSD` 与预算路由的 `PISO_LEGIVEL` 用 `toLocaleString("pt-BR")` 写 USD。这是数字格式混用，不是葡语句子。不把它改成人民币。
6. **可选货币没有 CNY。** `MOEDAS_SERVIDAS` 是 AOA、BRL、EUR、MXN、USD。`formatCents` 能按 ISO 代码格式化传入的货币，但选择器不提供人民币。这是币种能力，不是把界面语言当成货币。
7. **媒体读取失败时写入中央的通知**（`textoDoAvisoDeMidiaNaoLida` 及各条原因）仍是葡语。只在读取失败时出现。给模型的 `[o cliente enviou uma mídia…]` 标记也保持葡语，测试锁着「mídia」一词；它是模型上下文，不是屏幕句子。
8. **客户开发智能体配置失败时的 API 句子**（`AgentSetupError`）多数不在字典里。界面若用 `t(err.message)` 展示，缺键会原样显示葡语。这是单条功能的错误路径。
9. **引导文案**「Escreve a sugestão aqui, em português, e espera」的中文仍说建议用葡萄牙语书写。对应的是改进建议生成，不是案例讨论助手。生成器本身若仍产出葡语，改这句话会变成假说明。本轮只改了案例讨论助手。
10. **已入库的历史。** 旧的智能体 `system_prompt`、旧的收件箱标题/正文、旧的活动问候，不回写。
11. **注册旅程 e2e** 仍查找「Confirme seu e-mail」。对着 zh-CN 默认认证信跑会失败。本轮不跑 e2e，也不改那条规格。

## ACCEPTABLE — 业务上应保留

- 字典键本身，以及用户选择 pt-BR 时看到的葡语。
- `IDIOMA_SEM_ARVORE = "pt-BR"`。把它改成 zh-CN 会让无树片段和一批测试改口。
- 安装器 CLI（`_i18n.sh`、`DESKCOMM_IDIOMA_CLI`）。本轮明确不做。
- `America/Sao_Paulo` 作为 LGPD、邀请、SLA 的业务时区。界面语言变了，法律/业务日期仍按这个时区。
- 法规与证件标识：LGPD、Art. 18、Lei nº 13.709/2018、CPF、CNPJ、PAdES、DPO。出现在已翻译句子里时保留专名。
- `formatCentsBRL` 使用 `pt-BR`：这是雷亚尔的书写习惯，不是把中文界面改成巴西货币。
- BRL / USD 按业务货币显示。不为 zh-CN 把雷亚尔换成人民币。
- 退订检测词表（`PARAR`、`BAJA`、`STOP`、`descadastrar`）。这是用户会发来的词，不是我们写出的界面句子。
- 未知 locale 的外发脚回退 `PARAR`。
- 语言自称经 `t()` 之后的译名，例如「葡萄牙语（巴西）」。
- 产品名与单位：WhatsApp、Google、Meta、Asaas，以及 `tokens`。
- 扩展列表排序使用 `localeCompare("pt-BR")`，只影响顺序。
- 23 条孤儿 zh-CN 键（字典里没有对应葡语键，合并时忽略）。
- 注释、日志、测试夹具里的葡语。

## 门禁

在 `/Users/renjianxin/Projects/deskcomm-crm-cn` 跑过：

- `pnpm typecheck`：通过
- `tests/unit/i18n-chines-completo.test.ts`、`i18n-a-data-segue-o-idioma.test.ts`、`i18n-espanhol-cobre-a-tela.test.ts`、`i18n-catalogo-do-menu.test.ts`、`i18n-erros-de-extracao-cobertos.test.ts`、`i18n-provedores-e-pontos.test.ts`：通过
- `tests/unit/i18n-residual-zh.test.ts`：通过。上述 P0 渲染里的用户可见葡萄牙语 = 0
- 扩展、目录、邀请/认证邮件、退订脚、案例上下文、停滞案例、跟进、活动渲染、LGPD PDF、媒体派生等相关单测：通过

未做：安装器 CLI 中文化、镜像构建、VPS 部署、提交、再次推送。
