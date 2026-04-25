# Supabase 部署说明

## 1. 创建 Supabase 项目
- 新建一个 Supabase 项目
- 打开 `Project Settings -> API`
- 记录以下信息：
  - `Project URL`
  - `anon public key`

## 2. 创建甲方管理员账号
- 打开 `Authentication -> Users`
- 创建一个固定管理员账号
- 邮箱填入你要使用的管理员邮箱
- 密码设置为你准备给甲方后台使用的密码

然后把这个邮箱写到 [config.js](C:/Users/l/Desktop/fd/ui-design-studio/config.js) 的 `adminEmail`。

## 3. 初始化数据库
在 Supabase SQL Editor 里执行：

[20260424_create_workspace_state.sql](C:/Users/l/Desktop/fd/ui-design-studio/supabase/migrations/20260424_create_workspace_state.sql)

它会创建：
- `workspace_state` 表
- `updated_at` 自动更新时间触发器
- 只允许管理员本人读写的 RLS 策略
- Realtime 发布

## 4. 部署签署函数
把下面的函数部署到 Supabase：

[sign-contract/index.ts](C:/Users/l/Desktop/fd/ui-design-studio/supabase/functions/sign-contract/index.ts)

函数配置文件在：

[supabase/config.toml](C:/Users/l/Desktop/fd/ui-design-studio/supabase/config.toml)

其中已经把 `sign-contract` 设成 `verify_jwt = false`，这样乙方不用登录账号，也能通过签署链接访问。

## 5. 配置前端
编辑 [config.js](C:/Users/l/Desktop/fd/ui-design-studio/config.js)：

```js
window.__HETONG_SUPABASE__ = {
  url: "https://你的项目.supabase.co",
  anonKey: "你的 anon key",
  adminEmail: "甲方管理员邮箱",
  workspaceId: "hetong-main",
};
```

说明：
- `workspaceId` 用来区分你的这一套合同库
- 单管理员场景下保持一个固定值即可

## 6. 发布网页
把当前仓库推到 GitHub Pages 后，网页会继续从静态站打开，但数据会写到 Supabase。

## 7. 验证流程
1. 甲方打开后台，输入管理员密码登录
2. 发布一份合同
3. 用手机打开乙方签署链接
4. 完成签署后，回到甲方后台看状态是否变成 `乙方已签署`
5. 在另一台已登录的甲方设备上确认是否自动刷新到最新状态
