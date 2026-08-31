import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const DRAFT_KEY = "genesis_local_draft_v1";
const $ = (selector) => document.querySelector(selector);
let writeTimer;
let syncTimer;

function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"); }
  catch { return {}; }
}

function writeDraft(field, value) {
  const draft = readDraft();
  draft[field] = value;
  draft.savedAt = new Date().toISOString();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function status(text) {
  const el = $("#draft-status");
  if (el) el.textContent = text;
}

function fieldId(el) {
  if (el.id === "title" || el.id === "logline") return `base:${el.id}`;
  if (el.dataset.wt) return `world:${el.dataset.wt}`;
  if (el.dataset.pf) {
    const person = $(".person-choice.active")?.dataset.p;
    return person ? `person:${person}:${el.dataset.pf}` : null;
  }
  if (el.dataset.ef) {
    const event = $(".event-item.active button[data-e]")?.dataset.e;
    return event ? `event:${event}:${el.dataset.ef}` : null;
  }
  return null;
}

function addControls() {
  const card = $("#auth-view .auth-card");
  const emailButton = $("#signin");
  if (card && emailButton && !$("#github-signin")) {
    const github = document.createElement("button");
    github.id = "github-signin";
    github.type = "button";
    github.className = "github-login";
    github.textContent = "使用 GitHub 登录";
    github.addEventListener("click", async () => {
      const message = $("#auth-message");
      try {
        const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        const { error } = await client.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo: window.location.href }
        });
        if (error) throw error;
      } catch (error) {
        message.textContent = `GitHub 登录暂不可用：${error.message}`;
      }
    });
    emailButton.before(github);
    const note = document.createElement("p");
    note.className = "github-note";
    note.textContent = "推荐使用 GitHub 登录；邮箱链接仍可作为备用。";
    github.after(note);
  }

  const header = $("#app-view header");
  if (header && !$("#draft-bar")) {
    const bar = document.createElement("div");
    bar.id = "draft-bar";
    bar.innerHTML = '<span id="draft-status">本机草稿已就绪</span><button id="restore-draft" type="button">恢复本机草稿</button><button id="clear-draft" type="button">清除草稿</button>';
    header.after(bar);
    $("#restore-draft").addEventListener("click", restoreDraft);
    $("#clear-draft").addEventListener("click", () => {
      localStorage.removeItem(DRAFT_KEY);
      status("本机草稿已清除");
    });
  }
}

function findField(key) {
  const [kind, id, name] = key.split(":");
  if (kind === "base") return document.getElementById(id);
  if (kind === "world") return document.querySelector(`[data-wt="${id}"]`);
  if (kind === "person") {
    document.querySelector(`.person-choice[data-p="${id}"]`)?.click();
    return document.querySelector(`[data-pf="${name}"]`);
  }
  if (kind === "event") {
    document.querySelector(`button[data-e="${id}"]`)?.click();
    return document.querySelector(`[data-ef="${name}"]`);
  }
}

function restoreDraft() {
  const draft = readDraft();
  let restored = 0;
  Object.entries(draft).forEach(([key, value]) => {
    if (key === "savedAt") return;
    const field = findField(key);
    if (!field) return;
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    restored += 1;
  });
  status(restored ? `已恢复 ${restored} 项本机草稿，正在同步` : "没有可恢复的本机草稿");
  if (restored) setTimeout(() => $("#save")?.click(), 500);
}

function autoSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (!navigator.onLine) return status("网络不可用：内容已安全留在本机草稿");
    if ($("#app-view")?.classList.contains("hidden")) return;
    status("本机草稿已保存 · 正在同步云端");
    $("#save")?.click();
    setTimeout(() => status("已自动提交云端同步 · 本机草稿仍保留"), 700);
  }, 1200);
}

document.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) return;
  const key = fieldId(event.target);
  if (!key) return;
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    writeDraft(key, event.target.value);
    status("本机草稿已保存");
    autoSync();
  }, 350);
});

const style = document.createElement("style");
style.textContent = `
  .github-login{width:100%;margin:0 0 .55rem;background:#192b36;border:1px solid #5b91a4;color:#e7fbff;padding:.78rem 1rem;border-radius:.65rem;font-weight:700;cursor:pointer}.github-login:hover{border-color:#7be1d8;background:#203944}.github-note{margin:-.1rem 0 .8rem;color:#8fb5c1;font-size:.82rem}.auth-card .github-login+ .github-note{line-height:1.4}#draft-bar{display:flex;gap:.55rem;align-items:center;margin:.7rem 0 1.1rem;padding:.55rem .75rem;border:1px solid #244756;border-radius:.65rem;background:#0c2028;color:#9bc7d0;font-size:.82rem}#draft-status{margin-right:auto}#draft-bar button{border:1px solid #315866;border-radius:.45rem;background:transparent;color:#bde5e9;padding:.35rem .55rem;cursor:pointer}@media(max-width:700px){#draft-bar{flex-wrap:wrap;font-size:.76rem}#draft-status{width:100%;margin-right:0}}
`;
document.head.append(style);

addControls();
new MutationObserver(addControls).observe(document.body, { childList: true, subtree: true });
