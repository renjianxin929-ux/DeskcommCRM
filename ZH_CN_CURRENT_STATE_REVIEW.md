# ZH-CN 当前状态审查

审查对象：`origin/feat/zh-cn-complete` @ `9b46a4709ca61e241f2eb3e9fb1899ae83f0ee49`  
对照基线：upstream `main` @ `41e2f6e05a373eef3a29c3d3a51bb3506bd7cdd3`  
本地工作区：`/Users/renjianxin/Projects/deskcomm-crm-cn`  
日期：2026-09-26

本文件只记录现状。没有新增翻译，没有改 fork `main`，没有部署，没有构建镜像。

## 本地对齐

已执行的命令把本地分支指到远程 tip，并留下备份：

- `backup/zh-cn-remote-9b46` → `9b46a4709ca61e241f2eb3e9fb1899ae83f0ee49`
- 当前分支 `feat/zh-cn-complete` 跟踪 `origin/feat/zh-cn-complete`
- HEAD 与远程 tip 相同
- 对齐后 `git status`：clean，与 `origin/feat/zh-cn-complete` 同步
- `41e2f6e..HEAD` 正好 12 个提交，ahead 12 / behind 0

`git diff --stat 41e2f6e..HEAD`：

```
 .env.example                            |    4 +-
 hostgator-setup-kit/install.sh          |   23 +-
 lib/i18n/datas.ts                       |    3 +-
 lib/i18n/dicionario.ts                  |   10 +
 lib/i18n/registro.ts                    |    8 +-
 lib/i18n/traducoes/zh-CN.json           | 1002 ++++++++++++++++++++++++++++++-
 scripts/bootstrap-owner.ts              |    4 +-
 tests/unit/i18n-chines-completo.test.ts |   59 ++
 8 files changed, 1092 insertions(+), 21 deletions(-)
```

## 12 个提交

从旧到新。后 5 个提交只追加 `zh-CN.json`，没有再改运行时接线。

| Commit | 说明 | 实际改动 |
| --- | --- | --- |
| `b0486e651` | serve Simplified Chinese interface | `lib/i18n/registro.ts`：`zh-CN` 从 `em_construcao` 升为 `completo`，维护者写成 `renjianxin929-ux`。语言因此进入可选列表。 |
| `91ad4d66c` | format dates in Simplified Chinese | `lib/i18n/datas.ts`：date-fns 增加 `zhCN`。 |
| `6a78c6074` | load Simplified Chinese catalog at runtime | `lib/i18n/dicionario.ts`：模块加载时把 `zh-CN.json` 写进 `DICIONARIO`。词典里没有的键被丢弃。 |
| `40983ba02` | make Simplified Chinese available during install | `hostgator-setup-kit/install.sh`：产品语言 `APP_LOCALE` 增加选项 3，空值和未知值落到 `zh-CN`。安装器自己的文案语言没有改。 |
| `766824a2f` | bootstrap new owners in Simplified Chinese | `scripts/bootstrap-owner.ts`：可写入 `zh-CN`；无法识别的 `APP_LOCALE` 从 `pt-BR` 改为 `zh-CN`。 |
| `8cd285921` | default new installations to Simplified Chinese | `.env.example`：`APP_LOCALE=zh-CN`。只是示例，不改变已安装环境。 |
| `343e7e0a9` | require complete Simplified Chinese coverage | 新增 `tests/unit/i18n-chines-completo.test.ts`。这条测试在后续翻译提交之后仍然失败。 |
| `6a1e35d5c` | acquisition and agent setup | `zh-CN.json` +181 键。站点捕获脚本、Google Ads、获客与智能体设置一类文案。 |
| `120fc9b42` | prospecting, admin and WhatsApp | `zh-CN.json` +201 键。找企业、Apify、管理端与 WhatsApp 流程。 |
| `d2781476c` | finance, automation, provider and admin | `zh-CN.json` +201 键。营业时间、财务、自动化、供应商与管理流程。 |
| `80422e4bc` | Jev, operations, inbox and security | `zh-CN.json` +201 键。Jev 失败提示、收件箱操作与安全流程。 |
| `9b46a4709` | scheduling, finance, signup and customer | `zh-CN.json` +221 键。日程链接、报名与客户流程。当前 tip。 |

上游目录 5,398 键。这 12 个提交净增 1,000 键，现在 6,398 键。没有删除旧键。

## 直接回答

### 1. 这 12 个提交分别做了什么？

前 7 个提交把已经存在、但尚未对外提供的简体中文目录接成“已完成语言”，并改了 HostGator 安装脚本和本地 bootstrap 的默认产品语言。后 5 个提交给目录补了 1,000 条译文。它们没有改组件，没有把界面字符串包进 `t()`。

### 2. 是否已经把 zh-CN 真正接入运行时？

接入了，而且会显示在语言选择器里。

- `nivel: "completo"` 使 `zh-CN` 进入 `IDIOMAS`。个人设置、组织设置和 `Accept-Language: zh` 都可以选到它。
- `traduzir(texto, "zh-CN")` 在键存在时返回目录译文。目录里已有的键，运行时测试是通过的。
- `localeDeData("zh-CN")` 使用 date-fns 的 `zhCN`。日期层测试通过，三种语言的日期字符串彼此不同。
- 键不存在时，`traduzir` 返回葡萄牙语原文。这是当前界面上葡萄牙语的主要来源。

运行时默认语言仍然是葡萄牙语：`IDIOMA_PADRAO = "pt-BR"`。没有偏好、无法识别的语言、以及 `app/503/page.tsx`，都会落到葡萄牙语。

### 3. 是否真的做到全部用户可见界面中文，还是只是核心页面？

两者都不是。词典覆盖率约 83%，不是核心导航的小范围翻译，也不是全部界面。

`DICIONARIO` 有 7,682 个键，其中 6,375 个有非空 `zh-CN`。缺 1,307 个（17%）。缺的键集中在词典后部（大约第 8,000 行到文件末尾），对应较晚进入产品的表面：扩展、营销活动、部分设置、连接、日程、管理、知识库、Asaas、技能、案例通知、Google 登录、外部数据。

主导航标签已经是中文，例如 Inbox → 会话收件箱，Agenda → 日程，Configurações → 设置。选中文之后，已翻译的句子是中文，未翻译的句子仍是葡萄牙语。

### 4. 是否还残留 pt-BR 文案？

会残留，而且用户能看见。

产品屏幕里，按上游西班牙语门禁同一套规则扫描（`app/` 与 `components/` 的 JSX 和可见属性，排除 `app/design` 与 `app/vitrine-agenda`，排除日期格式和网址）：带葡萄牙语标记、且没有经过 `t()` / `traduzir()` 的文本是 **0**。界面字符串大体已经包进 `t()`。葡萄牙语来自 `t()` 回退，以及几处故意或漏掉的硬编码。

数量：

| 类别 | 数量 | 用户能否看到 |
| --- | ---: | --- |
| 词典键没有 zh-CN，`traduzir` 回退葡萄牙语 | 1,307 | 能。其中 1,106 个在产品源码里以引号字面量出现 |
| 产品 JSX 中带葡萄牙语标记且未经过 `t()` | 0 | 按门禁规则，没有 |
| 目录译文与葡萄牙语键完全相同 | 19 | 能，但是 CRM、LGPD、CNPJ、UTC、邮箱示例、广告指标缩写 |
| 目录译文不含汉字 | 23 | 同上，外加 `{{volta}}`、`Base URL`、`Webhook URL`、`AI` |
| 目录里有、词典里没有、加载时丢弃 | 23 | 不能 |
| `global-error.tsx` 硬编码葡萄牙语 | 1 个页面 | 能。`<html lang="pt-BR">`，标题、说明、按钮都不经过 `t()` |
| `app/503/page.tsx` | 1 个页面 | 能。调用了 `traduzir`，但语言被固定成 `IDIOMA_PADRAO`（pt-BR） |
| 扩展标题/摘要 | 全部扩展清单 | 能。schema 只有 `pt-BR` 和可选 `es`，`zh-CN` 回退葡萄牙语 |
| 安装器 CLI | 整份 `_i18n.sh` | 操作者能看见。只有 pt-BR / es，没有中文 |

`global-error.tsx` 里门禁只豁免了长说明句。同页还有「Algo deu errado」「Copiar ID」「Copiado!」「Tentar de novo」。其中几句没有重音，正字法门禁看不见它们。目录里其实已有「出错了」「复制 ID」「重试」，这个错误页没有使用。

### 5. 中文日期、时间、数字、默认组织语言、新安装默认语言是否完整？

| 项 | 状态 |
| --- | --- |
| 日期 / 时间的 date-fns locale | 已接入。`zh-CN` 使用 `zhCN`。`i18n-a-data-segue-o-idioma` 通过。 |
| 日期格式字符串本身 | 目录里已有的 `'de'` / `'às'` 模式没有把葡萄牙语介词留在译文里。未翻译的键仍会把葡萄牙语格式串原样显示。 |
| 数字 | 不完整。界面多处把 `toLocaleString("pt-BR")` 写死。本机实测 `1234567.89`：pt-BR 为 `1.234.567,89`，zh-CN 为 `1,234,567.89`。 |
| 货币 | 不完整。`lib/money.ts` 用 pt-BR 格式化 BRL / USD。 |
| 运行时默认语言 | 仍是 pt-BR。 |
| 组织语言 | HostGator `install.sh` 新建组织时可以把 `organizations.locale` 写成 `zh-CN`。单机安装脚本和 Ubuntu 本地安装脚本仍写入 `pt-BR`。 |
| 新安装默认语言 | 只在一部分入口成立。见第 7 节。 |
| 503 / 无会话维护页 | 固定 pt-BR。 |

写死 pt-BR 数字格式的产品位置包括：`components/ai/UsageChart.tsx`、`components/admin/tenants/TenantOverview.tsx`、`components/admin/usage/UsageCharts.tsx`、`components/admin/usage/UsageTable.tsx`、`components/inbox/media/media-utils.ts`、`lib/ui/TokenCounter.tsx`、`lib/money.ts`、`app/app/ai/evolution/_client.tsx`、`app/app/ai/usage/_client.tsx`、`app/app/ai/agents/[id]/_components/AgentForm.tsx`、`app/app/ads/meta/_components/TabelaDeCampanhas.tsx`、`app/api/v1/ai/budget/route.ts`、`lib/agent-engine/edge/llm/orcamento.ts`、`lib/agent-engine/guardrails/promise/engine.ts`。

邮件和 LGPD PDF 仍用 pt-BR 日期。上游把它们标成界面之外：邀请邮件、LGPD 邮件、巴西法律文书。`app/api/v1/admin/dashboard/kpis/route.ts` 在写入时用 pt-BR 拼日期，属于已记录内容，不是当场渲染的界面。

### 6. Auth / Onboarding / Inbox / CRM / AI / Connections / Settings / Admin / Error / Empty State 是否全部覆盖？

都没有全部覆盖。下表是「缺少 zh-CN、且在该表面的产品源码中以引号出现」的键数。一个键可以出现在多个目录，所以不能把各行相加。

| 表面 | 缺译键（引号命中） | 判断 |
| --- | ---: | --- |
| Auth | 5 | 登录等基础词已有译文（Entrar → 登录）。「Entrar com Google」没有译文。 |
| Onboarding | 8 | 大部分已译。发现入口等后加文案仍缺，例如「Ser avisado no seu WhatsApp」。 |
| Inbox | 21 | 主路径有译文。仍有缺句，例如「Assumir e responder」。 |
| CRM | 39 | 联系人、漏斗、看板有缺口，例如「Site (landing page)」。 |
| AI | 247 | 最大缺口之一。知识库、技能、服务流程、供应商都在未译尾部。 |
| Connections | 72 | WhatsApp / 通道有缺口，包括「Comandos pelo celular」。 |
| Settings | 88 | 组织与转换等设置页有成段未译。 |
| Admin | 31 | 平台管理有缺口，包括「Fluxos de atendimento」。 |
| Agenda | 34 | 日程 locale 已接上，文案仍缺，例如「Outro horário」。 |
| Error / Empty（指定页面路径） | 0 | 不代表错误态已完成。API 错误句在 `app/api` 有 41 个缺译键。`global-error` 和 `503` 整页葡萄牙语。「Tente novamente」不在目录里。「Nenhum resultado」已译成「无结果」。 |

另外 188 个缺译键出现在 `components/extensions`，119 个在 `app/app/campaigns`，56 个在 `app/app/integracao-dados`。

西班牙语门禁里冻结的 9 个动态键，中文目录也没有：`informativo`、`Iniciar fluxo de mensagem`、`No aniversário de um contato`、`Quando faltarem N dias para uma data do funil`、四条「Quando um horário…」、`Assistente com autonomia de operação`。这些在西班牙语界面上已经是葡萄牙语，中文界面同样是。

### 7. Installer CLI 的改动是否属于需要的范围？

`install.sh` 改的是产品语言 `APP_LOCALE`，不是安装器界面语言。这个默认值属于「新安装默认简体中文」需要的范围。它没有把安装器翻译成中文，所以不是把整份 CLI 文案扩进本次汉化。

实际效果只覆盖 HostGator `install.sh` 这一条路：

- 菜单增加 `3) 简体中文`，Enter 和空值变成 `zh-CN`。
- 选项 `1` / `2` 仍分别是 pt-BR / es。
- 提问句本身仍是葡萄牙语。
- 新的 `t("Escolha 1 (Português), 2 (Español) ou 3 (简体中文)…")` 不在 `hostgator-setup-kit/_i18n.sh` 里。
- `DESKCOMM_IDIOMA_CLI` 仍只有 pt-BR 和 es。安装器输出不会变成中文。
- 新建组织的显示名仍是 `Minha Empresa`。

另外两个安装入口仍把产品语言写成葡萄牙语：

- `ubuntu-local-installer.sh`：`export APP_LOCALE="pt-BR"`
- `hostgator-setup-kit/install-single-server.sh`：`set_env_var … APP_LOCALE pt-BR`，然后再跑 `install.sh --yes`。新的 `case` 会保留已经写好的 `pt-BR`。

所以「新安装默认中文」在单机安装和 Ubuntu 本地安装上不成立。

### 8. 现有测试实际能否证明「完整中文」，还是 Gate 太弱？

不能证明。新测试里真正的完整性断言是失败的，所以它没有把未完成的目录涂成绿色。旁边几条断言太窄，通过它们不能当成完成。

`tests/unit/i18n-chines-completo.test.ts` 四条里：

1. **失败。** 每个词典键都要有非空 zh-CN。缺 1,307 个。这是有用的门禁，当前分支没有通过。
2. **通过。** 已有译文的占位符与键一致。不检查缺键。
3. **通过。** `traduzir` 对已有键返回目录值。不检查缺键。
4. **通过。** 14 个导航/按钮词的译文不等于葡萄牙语键。不要求汉字，不覆盖页面。

它不检查：界面是否都走 `t()`、译文是否为中文、数字、默认语言、安装器、503、扩展清单。

上游其它门禁：

- `i18n-espanhol-cobre-a-tela` 通过。它只要求 `es` 列，不要求 `zh-CN`。正字法规则会漏掉没有重音的葡萄牙语。
- `catalogo-de-idioma-tem-forma` 通过，文件头写明「不收取完整度」。禁止 `i18n/traducoes/` 这种导入路径；本分支用的是 `./traducoes/zh-CN.json`，这条检查看不见。中文目录因此打进所有用户的词典包。
- 日期测试通过，证明 date-fns locale 分语言，不证明数字和全部格式串。

## 已完成能力

- `zh-CN` 是对外提供的语言，选择器、组织语言和 `Accept-Language: zh` 可以到达它。
- 目录在 `dicionario.ts` 加载，已有键会从 `traduzir` 返回。
- 主导航和大量较早的界面句已有简体中文。
- date-fns 日期 locale 包含 `zhCN`。
- HostGator `install.sh`、`bootstrap-owner.ts` 和 `.env.example` 可以把新安装的产品语言记成 `zh-CN`。
- 占位符没有在已翻译的键上丢失或新增。
- 产品屏幕上，带葡萄牙语标记的 JSX 已经包在 `t()` 里（设计系统陈列页除外）。

## 未完成能力

- 1,307 个界面键在中文模式下显示葡萄牙语。
- 语言级别已经是 `completo`，和目录实际覆盖不符。用户会看到中葡混排。
- Typecheck 失败。扩展筛选仍把 locale 标成 `"pt-BR" | "es"`。
- 运行时默认语言、503 页、未知语言仍是葡萄牙语。
- 数字和货币格式不是 zh-CN。
- 扩展清单没有中文栏。
- 根错误页硬编码葡萄牙语。
- 单机安装和 Ubuntu 本地安装仍默认 pt-BR。
- 安装器 CLI 不是中文。
- 邮件、LGPD PDF、设计系统陈列页保持葡萄牙语。

## 测试结果

依赖：`pnpm install --frozen-lockfile` 成功（约 2 分 30 秒）。

`pnpm typecheck` 失败，exit 2：

```
components/extensions/ExtensionsManager.tsx(868,7): error TS2345
components/extensions/ExtensionsManager.tsx(872,91): error TS2345
Argument of type '"pt-BR" | "es" | "zh-CN"' is not assignable to parameter of type '"pt-BR" | "es"'.
```

`useIdioma()` 在语言提升后包含 `zh-CN`。`matchesExtensionFilter`（`components/extensions/ExtensionCatalog.tsx`）和 `lib/extensions/manifest.ts` 的 `localizedTextSchema` 仍只有 pt-BR / es。`localize()` 对非西班牙语返回葡萄牙语。

相关单元测试：`Test Files  2 failed | 9 passed (11)`，`Tests  12 failed | 75 passed (87)`。

通过：

- `tests/unit/i18n-espanhol-cobre-a-tela.test.ts`
- `tests/unit/i18n-a-data-segue-o-idioma.test.ts`
- `tests/unit/catalogo-de-idioma-tem-forma.test.ts`
- `tests/unit/idioma-da-interface.test.ts`
- `tests/unit/idioma-aparece-pelo-nivel-do-registro.test.tsx`
- `tests/unit/i18n-catalogo-do-menu.test.ts`
- `tests/unit/i18n-erros-de-extracao-cobertos.test.ts`
- `tests/unit/i18n-provedores-e-pontos.test.ts`
- `tests/unit/agenda-e-lang-seguem-o-idioma.test.tsx`

失败：

- `tests/unit/i18n-chines-completo.test.ts`：4 条里 1 条失败，即「每个词典键都有 zh-CN」。其余 3 条通过。
- `tests/unit/instalador-idioma-da-cli.test.ts`：21 条里 11 条失败。本机是 bash 3.2.57。该测试写明 `_ES` 关联数组只在 bash 4.4 及以上装载；这里表大小是 0，所以西班牙语断言整批失败。这 11 条不能当成这 12 个提交弄坏了安装器西班牙语。可以单独确认的是：新的中文选项提示句不在 `_i18n.sh`。

## P0 / P1 / P2

### P0

1. 不要把当前分支当成「全部界面中文」。1,307 / 7,682 个词典键会回退葡萄牙语，语言却已经以 `completo` 提供给用户。
2. 修好 typecheck：`ExtensionsManager` 把含 `zh-CN` 的 `Idioma` 传进只接受 `"pt-BR" | "es"` 的 `matchesExtensionFilter`。
3. `i18n-chines-completo` 的完整性断言保持红色，直到缺键补齐。不要放宽这条断言来换取通过。

### P1

1. 补齐词典尾部缺的 1,307 个键，优先：扩展、营销活动、设置、连接、AI 流程/知识库/技能、日程、管理、API 错误句。
2. 决定运行时默认语言。若新安装应为中文，`IDIOMA_PADRAO` 与 `app/503/page.tsx` 需要跟着变；未知语言现在会显示葡萄牙语。
3. 让 `ubuntu-local-installer.sh` 和 `install-single-server.sh` 的 `APP_LOCALE` 与 HostGator 默认值一致，否则那两条安装路仍是葡萄牙语组织。
4. 数字和货币改为当前界面的 BCP-47（`zh-CN`），不要在组件里写死 `pt-BR`。
5. 扩展清单的本地化 schema 和 `localize()` 要能表达 zh-CN，否则扩展名称在中文界面仍是葡萄牙语。
6. `global-error.tsx` 在不能使用 provider 的前提下，仍要有一条不依赖 React context 的中文路径。现在整页是葡萄牙语。
7. 9 个冻结动态键补上中文，否则对应菜单在中文里继续显示葡萄牙语。

### P2

1. 安装器 CLI 保持葡萄牙语/西班牙语即可，除非操作者也要看中文。若保留现状，新的 `t()` 提示至少要补进 `_ES`，避免西班牙语安装器漏句。
2. 新建组织名 `Minha Empresa` 是否要改成中文默认名，单独决定。它是数据，不是词典键。
3. 23 条孤儿目录键可以清理。19 条与原文相同的品牌/缩写可以保留。
4. `dicionario.ts` 静态导入整份中文目录后，葡萄牙语和西班牙语用户也会加载它。体积问题，不阻塞正确性。
5. 正字法扫描漏掉无重音葡萄牙语。完整性应以词典缺键为准，不要只看 JSX 扫描为 0。
6. 邮件和 LGPD PDF 维持上游的葡萄牙语边界，除非单独开一个语言传递任务。

## Verdict

**未达到「所有界面中文」。**

zh-CN 已经进入运行时，大约 83% 的词典键有简体中文，日期 locale 可用，HostGator 安装脚本可以把新产品语言记成 zh-CN。选中文之后，其余约 17% 的界面句、扩展名称、数字格式、503 页、根错误页，以及单机/Ubuntu 安装出来的默认语言，仍然是葡萄牙语。当前分支 typecheck 失败，完整性测试失败。
