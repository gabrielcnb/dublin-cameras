import { NextResponse, type NextRequest } from "next/server"

// Gate de PIN do site inteiro: bloqueia TODO acesso atrás de um PIN antes de
// servir qualquer página, então nada do conteúdo vai pro código-fonte sem o
// cookie. Projeto em construção.
const SITE_PIN = "REDACTED"
const PIN_COOKIE = "site_pin"

function pinScreen(message?: string) {
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Acesso restrito</title>
<style>
  *{box-sizing:border-box} body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:#0a0a0a;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center}
  .card{background:#171717;border:1px solid #262626;border-radius:18px;padding:36px 32px;width:100%;max-width:340px;text-align:center}
  .icon{width:56px;height:56px;border-radius:50%;background:#262626;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px}
  h1{font-size:20px;margin:0 0 4px} p{color:#a3a3a3;font-size:14px;margin:0 0 20px}
  input{width:100%;text-align:center;font-size:24px;letter-spacing:.5em;font-family:monospace;padding:12px;
  border:2px solid #333;border-radius:12px;background:#0a0a0a;color:#fff;outline:none}
  input:focus{border-color:#666} button{width:100%;margin-top:14px;padding:12px;border:0;border-radius:12px;
  background:#fff;color:#0a0a0a;font-weight:600;font-size:15px;cursor:pointer}
  .err{color:#f87171;font-size:13px;margin-top:10px;min-height:18px}
</style></head><body>
<div class="card">
  <div class="icon">🔒</div>
  <h1>Acesso restrito</h1>
  <p>Digite o PIN para continuar</p>
  <form method="POST" action="/?pin-check=1">
    <input type="password" name="pin" inputmode="numeric" maxlength="10" placeholder="PIN" autofocus>
    <div class="err">${message ?? ""}</div>
    <button type="submit">Entrar</button>
  </form>
</div></body></html>`
  return new NextResponse(html, {
    status: 401,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  })
}

export async function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl

  if (request.method === "POST" && searchParams.get("pin-check") === "1") {
    const form = await request.formData().catch(() => null)
    const pin = String(form?.get("pin") ?? "").trim()
    if (pin === SITE_PIN) {
      const res = NextResponse.redirect(new URL("/", request.url))
      res.cookies.set(PIN_COOKIE, SITE_PIN, {
        httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30, path: "/",
      })
      return res
    }
    return pinScreen("PIN incorreto")
  }

  if (request.cookies.get(PIN_COOKIE)?.value !== SITE_PIN) {
    return pinScreen()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
