import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const auth = req.headers.get("Authorization");
  if (!auth) return Response.json({ error: "请先登录" }, { status: 401, headers: cors });
  const { prompt, context } = await req.json();
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return Response.json({ error: "尚未配置 OPENAI_API_KEY" }, { status: 503, headers: cors });
  const response = await fetch("https://api.openai.com/v1/responses", { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`}, body:JSON.stringify({model:"gpt-4.1-mini",input:`你是小说设定编辑。请用中文简洁、具体地回答。\n当前作品：${JSON.stringify(context)}\n\n用户问题：${prompt}`}) });
  if (!response.ok) return Response.json({ error: "GPT 暂时无法响应" }, { status: 502, headers: cors });
  const data = await response.json();
  return Response.json({ text: data.output_text || "未获得文本回复。" }, { headers: cors });
});
