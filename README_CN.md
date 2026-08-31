# 创世纪：GitHub Pages + Supabase 版

此版本无需自有域名。部署后网址会是：`https://Aslan-code1710.github.io/chuangshiji/`。

## 1. 配置 Supabase

1. 在 Supabase 项目左侧打开 **SQL Editor**，新建查询，粘贴并执行 `supabase/schema.sql` 的全部内容。
2. 打开 **项目设置 → API 密钥**，在 **Publishable key** 区域复制密钥。
3. 打开 `config.js`，将 `PASTE_YOUR_PUBLISHABLE_KEY_HERE` 替换为该 Publishable key。这个 key 可以放在前端；不要使用 Secret key 或 service_role key。
4. 在 **Authentication → URL Configuration** 中，把 `https://Aslan-code1710.github.io/chuangshiji/` 加入 Redirect URLs，保存。

## 2. 发布到 GitHub Pages

1. 在 GitHub 新建一个公开仓库，名称必须是 `chuangshiji`。
2. 上传本文件夹最外层的 `index.html`、`app.js`、`style.css`、`config.js`，以及 `supabase` 文件夹；不要把整个外层文件夹再包一层。
3. 仓库打开 **Settings → Pages**，Source 选 **Deploy from a branch**，Branch 选 `main` 与 `/ (root)`，保存。
4. 等待 GitHub 显示部署完成，然后访问上面的地址。

## 3. 开启 GPT 助手（可后续完成）

GPT 需要 Supabase Edge Function，避免把 OpenAI API Key 放到浏览器：

1. 安装并登录 [Supabase CLI](https://supabase.com/docs/guides/cli)。
2. 在本项目文件夹运行：`supabase link --project-ref cxoeweyasfrjudsmaczq`
3. 安全设置密钥：`supabase secrets set OPENAI_API_KEY=你的OpenAI_API密钥`
4. 部署函数：`supabase functions deploy gpt-assistant`

不要把数据库密码、Supabase Secret key、service_role key 或 OpenAI API Key 提交到 GitHub。
