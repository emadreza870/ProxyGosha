# ProxyGosha — Cloudflare Workers 上的 Telegram WEB 代理（中文版）

> 中文文档已同步至 v1.3.0。项目的主文档现在以波斯语维护（内容最全）：[README.md](../README.md)。

## v1.3.0 新特性

这是安全加固与性能版本。如果此前只设置了 `ADMIN_KEY`，所有旧链接仍与 v1.2.2 逐字节一致地工作（有 golden 测试保证）。

- **S1 — SECRET 与 ADMIN_KEY 解耦（推荐）：** 设置页同时生成 `ADMIN_KEY` 和 32 位十六进制 `SECRET`。旧模式（仅 `ADMIN_KEY`）下面板会显示醒目警告，并给出用于"冻结"现有链接的精确 SECRET 值；对弱口令 ADMIN_KEY 做熵检查（建议 24+ 字符）。
- **S2 — 抗主动探测：** `/api/v1/session`、`/api/v1/ws` 的一切失败与未知路径返回完全相同的响应（伪装商店）。商店品牌、配色、商品、favicon 与 `/health` 由密钥按部署确定性派生；未设置时 `SESSION_PATH`/`WS_PATH` 也从密钥派生（旧路径再兼容一个版本）。
- **S3 — Cookie 登录：** `/login` POST 表单，HttpOnly/Secure/SameSite=Strict 的 HMAC 签名 Cookie（6 小时）。URL 带 key 的旧方式仍可用但已废弃。隔离内存中的全局失败退避（不存储 IP）。
- **S4 — 令牌加固：** 令牌 HMAC 绑定 host；会话默认 6 小时；桥接重连时自动刷新 bootstrap 令牌；`KEY_EPOCH` 一键吊销全部令牌。
- **S5 — 端口严格隔离：** 每个端口只接受自己的密钥。旧行为需设 `LEGACY_PORT_SECRETS=1`。
- **S6 — 降低未认证 CPU 开销：** HMAC 校验设置上限并提前退出；`DECOY_URL` 使用 `caches.default`（60 秒）。
- **S7 — BUILD_SEAL 与 KDF 解耦：** seal 字节仅用于旧模式派生；新模式使用固定域分隔字符串。署名为普通常量。
- **F1 — 真正的上游合批：** 帧合并至 256 KiB：2 次 AES-CTR、1 次写入、1 个 WINDOW；与逐帧路径逐字节等价（有测试）。
- **F2 — DC 连接：** 每 isolate 记忆最近可用 IP:端口；阶梯并行尝试（~400ms 后第二路，最多 2 路并发，败者即关）；失败 60 秒降权。最坏情况 < 3.5 秒（原 ~12 秒）。
- **F3/F4 — 内存：** 单帧消息零拷贝；isolate 级队列字节上限（`MAX_ISOLATE_QUEUED`，默认 32MB）与压力下的自适应窗口。
- **F5 — 桥接重连：** 首次重试 ~200ms（带抖动），指数退避至 10s；保留 12 次上限。
- **F6 — `CARRIER=auto`：** 按文档化的启发式在 websocket-lanes/websocket 间选择。
- **F7 — 遥测：** cpuSuspect 指示、每 DC 延迟 EMA、`/status` 全量 env 报告。
- **R1 — 用户独立密钥：** 由标签 HMAC 派生，`USER_SECRETS` 列出并可单独吊销。旧 generator 模式已删除。
- **R2 — 面板：** 服务端 SVG 二维码、CSP 兼容复制按钮、端口延迟测试页、更醒目的 workers.dev 警告。
- **R3 — `DC_OVERRIDE`：** JSON 校验后覆盖 DC 列表。
- **R5 — `ALERT_URL`：** 可选告警 webhook（默认关闭；不发送 IP/令牌/密钥）。
- **移除：** `AD_TAG`、`GENERATOR_ENABLED`、`GENERATOR_KEY`、`ACCEPT_GENERATED`（ME 分析见 `docs/ME-notes.md`）。

## 快速开始

1. 创建 Worker，粘贴 `worker.js`，Deploy。
2. 打开 Worker 地址 —— 设置页会给出 `ADMIN_KEY` 与 `SECRET`，把两者都加入 Variables and Secrets，再 Deploy。
3. （强烈建议）绑定自定义域名：`workers.dev` 在伊朗、中国、俄罗斯等地被封锁。
4. 面板登录：`https://你的域名/login`（旧式 `https://你的域名/YOUR_ADMIN_KEY` 已废弃）。
5. 在 Telegram 中通过"Connect in Telegram"按钮、二维码或手动服务器/端口/密钥添加。

端口：`443 · 2053 · 2083 · 2087 · 2096 · 8443` —— 严格隔离：密钥只在其所属端口生效。

## 环境变量（代码实际读取）

| 变量 | 说明 |
|---|---|
| `ADMIN_KEY` | 面板必需。管理员密钥（建议 24+ 字符）。 |
| `SECRET` | 推荐。独立的 32 位十六进制密钥（443 端口及其他端口的基值）。 |
| `KEY_EPOCH` | 改变即吊销所有已发 carrier 令牌。 |
| `EXTRA_HOSTS` | 逗号分隔的附加域名。 |
| `DECOY_URL` | 伪装站点 URL（边缘缓存 60 秒）。 |
| `CARRIER` | `websocket-lanes`（默认）/ `websocket` / `auto`。 |
| `HOSTNAME` | 域名白名单（默认全部）。 |
| `MAX_STREAMS` | 每会话最大 MTProto 流（默认 6，最大 32）。 |
| `SESSION_PATH` / `WS_PATH` | carrier API 路径（默认由密钥派生）。 |
| `DEBUG` | `true` 开启诊断日志。 |
| `UP_BATCH_BYTES` | 上游合批上限（262144 = 256KiB）。 |
| `DATA_CHUNK` | DC→客户端分块大小（64KiB）。 |
| `MAX_ISOLATE_QUEUED` | isolate 全局队列字节上限（32MB）。 |
| `MAX_QUEUED` | 单会话队列上限（16MB）。 |
| `SESSION_TTL` | 会话 TTL 秒数（21600 = 6 小时）。 |
| `BOOTSTRAP_TTL` | bootstrap 令牌 TTL（3600）。 |
| `DC_OVERRIDE` | 覆盖 DC 列表的 JSON，如 `{"2":["149.154.167.50"]}`。 |
| `USER_SECRETS` | 用户标签列表，逗号分隔；可单独吊销。 |
| `LEGACY_PORT_SECRETS` | `1` 恢复 v1.2.2 跨端口行为。 |
| `ALERT_URL` | https 告警 webhook（默认关闭）。 |

完整波斯语文档（安装、故障排除、FAQ）：[README.md](../README.md)。变更日志：[CHANGELOG.md](../CHANGELOG.md)。安全策略：[.github/SECURITY.md](.github/SECURITY.md)。

## 许可与支持

MIT。作者：Amir Marandi ([t.me/amirdotlog](https://t.me/amirdotlog))。赞助：[donatr.ee/amirmarandi](https://donatr.ee/amirmarandi/)。
