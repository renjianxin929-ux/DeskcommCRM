# ZH-CN Release Acceptance

## Verdict

**READY_FOR_CN_DEPLOYMENT**

浏览器里的 15 条产品路径都打开了。页面不是 500，`html[lang]` 为 `zh-CN`，标题是中文或品牌名。最终一轮没有扫到未翻译的字典键、重音葡萄牙语、损坏的占位符、`[object Object]`、`Invalid Date` 或按钮溢出。

这不是部署许可。没有构建正式 Docker image，没有连接 Google VPS，没有改 fork `main`。

## Tested commit

浏览器测量的产品提交：

`0cc699b99e12885966923824eddc97b313ad9c12`

起点是 `014bca43b45df514e3818e801337320b30aa29a8`。测量之前，浏览器先在那个起点上跑出下面这些真实显示问题，各自独立提交：

| Commit | 为什么改 |
| --- | --- |
| `b3d2ced37` | 根文档 `lang` 写死 `pt-BR`。法律页没有客户端语言提供者，标题已经是中文，`html[lang]` 仍是葡萄牙语。 |
| `d9648145e` | 跟进页标题和「队列」Tab 没有走翻译。 |
| `7dfc30e50` | 注册、找回密码、恢复码的「Email」标签没有走翻译。 |
| `7348c82b2` | 日程类型名和「分钟」没有走翻译；周视图芯片还把翻译函数遮蔽了。 |
| `b93253be6` | 法律页运营方兜底，以及智能体编辑器里几条已经调用翻译、但字典没有中文的工具说明。 |
| `8a7d00015` | 「周」只躺在中文文件里，字典没有 `Semana` 这个键，日/月已翻译，周视图按钮仍是 `Semana`。 |
| `0cc699b99` | 联系人表格的姓名列调用了命名函数，但没有把翻译函数传进去，无名联系人显示 `Sem nome`。 |

`3168fbb70f8354d32294f26349aa02aa57e4a2e3` 只加入验收 spec、登录助手和 `FORA_DO_CI` 清单。它不改变被测界面。截图对应的是 `0cc699b99` 的构建。

本文件在产品 SHA 之后单独提交，验收记录不进入 `0cc699b99`。Release tag 指向该产品 SHA，不指向本提交，也不指向只加验收 spec 的 `3168fbb70`。

分支 `feat/zh-cn-complete` 以普通 push 发布。没有 force push，没有修改 fork `main`。

## Local stack

| 项 | 状态 |
| --- | --- |
| Docker Desktop | 未安装 |
| 容器运行时 | OrbStack 29.4.0，daemon ready。本机没有 Docker Desktop，启动的是已安装的 OrbStack，没有改生产部署。 |
| Supabase | `bash scripts/local-supabase.sh start` 成功。API `http://127.0.0.1:54321`，Postgres `127.0.0.1:54322/postgres`。baseline 已载入。OrbStack 上 `docker run --network host` 可用，没有改脚本。 |
| `.env.e2e` | `pnpm e2e:env` 生成。`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`，`SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`。没有 `supabase.co`，没有用工作区 `.env.e2e` 以外的 `.env.local`。 |
| 应用 | `pnpm e2e:build` 后由 Playwright 用 `.env.e2e` 执行 `next start`，端口 3001。构建检查确认浏览器包里是 `127.0.0.1:54321`。 |
| 浏览器 | Playwright Chromium。`locale=zh-CN`，`Accept-Language: zh-CN`。启动参数 `--disable-features=Translate,TranslateUI --disable-translate`。没有安装翻译扩展，没有使用 Chrome 自动翻译。 |
| 生产 | 没有连接生产 Supabase，没有连接 Google VPS。 |

`TEST_ENV_BLOCKER`：无。

## 15/15

每一条都检查了：HTTP 不是 500、`html[lang]=zh-CN`、标题无葡萄牙语、正文无未翻译字典键或重音葡萄牙语、无原始 key、无 `[object Object]`、placeholder 未损坏、按钮/Tab/Select 无明显中文溢出、无 `Invalid Date` / `NaN`。

| # | 路径 | 结果 | 标题 |
| --- | --- | --- | --- |
| 1 | 登录 `/login` | PASS | 登录 · DeskcommCRM |
| 2 | 首次 onboarding `/onboarding` | PASS | 中文欢迎与六个步骤 |
| 3 | 主导航 | PASS | 侧栏为中文（会话收件箱、销售漏斗、联系人、日程、连接、设置） |
| 4 | Inbox `/app/inbox` | PASS | 会话收件箱 · DeskcommCRM |
| 5 | 联系人 `/app/contacts` | PASS | 联系人 · DeskcommCRM |
| 6 | CRM / 销售漏斗 `/app/kanban` | PASS | 销售漏斗 · DeskcommCRM |
| 7 | Agenda `/app/agenda` | PASS | 日程网格、今天/日/周/月、类型芯片为中文 |
| 8 | AI Agent 列表 `/app/ai/agents` | PASS | 页面中文 |
| 9 | AI Agent 编辑 `/app/ai/agents/{id}` | PASS | 编辑器中文 |
| 10 | Knowledge `/app/ai/knowledge/sources` 与 Follow-up `/app/ai/followups` | PASS | 跟进、流程、队列为中文 |
| 11 | Connections `/app/connections` | PASS | 连接 · DeskcommCRM |
| 12 | Settings `/app/settings` | PASS | 设置 · DeskcommCRM |
| 13 | Admin `/admin` | PASS | 概览 — 平台管理 · DeskcommCRM |
| 14 | Empty / Dialog / Validation | PASS | 群发空状态、新建联系人对话框、空表单校验、登录空提交校验 |
| 15 | 公开页 | PASS | 找回密码、使用条款、隐私政策、创建账户 |

测试数据：

- `e2e-admin` 与 `e2e-dono` 的 `user_metadata.locale = zh-CN`
- 种子组织的 `organizations.locale = zh-CN`（跑完后 `afterAll` 恢复为种子约定的 `pt-BR`，并清掉用户 locale）
- 漏斗和日程用现有 `seed-e2e-kanban`、`seed-e2e-agenda`
- 不传 `locale` 调用 `fn_create_tenant_with_owner` → `zh-CN`
- 不传 `locale` 的列默认插入 → `zh-CN`

Inbox 没有现成的、不依赖 WAHA 的会话种子，所以看到的是中文三栏和空状态，不是一条消息线程。跟进列表同样是中文空状态，流程/队列 Tab 和主操作都在。

## Screenshots

`evidence/zh-cn-release/0cc699b9/`

起点上发现问题的那一轮留在 `evidence/zh-cn-release/014bca43/`，不作为通过证据。

| 文件 | 内容 |
| --- | --- |
| `01-login.png` | 登录 |
| `14-validacao-login.png` | 登录校验 |
| `02-onboarding.png` | Onboarding |
| `03-nav.png` / `03-nav-recorte.png` | 主导航 |
| `04-inbox.png` | Inbox |
| `05-contatos.png` | 联系人 |
| `06-funil.png` | 销售漏斗 |
| `07-agenda.png` | 日程 |
| `08-agentes.png` | 智能体列表 |
| `09-editor.png` | 智能体编辑器 |
| `10-conhecimento.png` | 知识库 |
| `10-followups.png` | 跟进 |
| `11-conexoes.png` | 连接 |
| `12-configuracoes.png` | 设置 |
| `13-admin.png` | 平台管理 |
| `14-vazio.png` | 群发空状态 |
| `14-dialogo.png` | 新建联系人对话框 |
| `14-validacao-dialogo.png` | 对话框校验 |
| `15-recuperar-senha.png` | 找回密码 |
| `15-termos.png` | 使用条款 |
| `15-privacidade.png` | 隐私政策 |
| `15-cadastro.png` | 创建账户 |
| `resultado.json` | 每条路径的 status、lang、title |

## 葡萄牙语

最终一轮用户可见的未翻译界面葡萄牙语：**0**（字典键、重音词、损坏占位符）。

有意保留、扫描器不把它当缺陷的 1 处：

- 平台管理仪表盘卡片标题 `Alertas WAHA`。`components/admin/dashboard/KPICards.tsx` 写明不翻译：WAHA 是渠道名，`lint:channels` 禁止把供应商名放进字典。副标题已经是中文。这是既有决定，不是这次漏翻。

不算界面缺陷的数据：

- 种子联系人、漏斗阶段、连接显示名、`Consulta E2E`、onboarding 里已创建的漏斗名 `Pedidos`
- 日程横幅里的环境变量名和本机 callback URL

## Visual defects

最终截图没有中文把按钮、Tab 或选择器撑破的情况。日程是「日 / 周 / 月」，日期是 `9月 27日 – 10月 3日` 和「周日 / 周一」。没有 `Invalid Date`。

`Alertas WAHA` 是上面那条有意保留的标签，不是布局溢出。

## Remaining P1

这些没有在本阶段修，也不构成这次的 `NOT_READY`：

- GoTrue 每套安装一份邮件模板，`supabase/templates` 仍是葡萄牙语
- 未使用的预算告警邮件仍是 `lang="pt-BR"`
- `lib/money.ts` 的 `formatCentsUSD` 与 BRL/USD 语义不动，没有改成 CNY
- 安装器 CLI 不汉化
- 历史 prompt、历史收件箱正文不改写
- 业务时区仍是 `America/Sao_Paulo`
- `Alertas WAHA` 等渠道中性改名之前保持现状

## 未做

- 没有构建正式 Docker image
- 没有部署 Google VPS
- 没有修改 fork `main`
- 没有使用 Chrome 翻译
