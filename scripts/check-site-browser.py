# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright==1.58.0"]
# ///
"""Check public rendering and app/legacy routing without authenticating or writing data."""

import argparse
import asyncio
import json
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import async_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--base-url", default="http://127.0.0.1:4174")
parser.add_argument("--output", default="temp/site-browser")
args = parser.parse_args()


async def check():
    base = args.base_url.rstrip("/")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[1]
    report = {"base": base, "viewports": [], "routes": [], "accessibility": []}
    async with async_playwright() as engine:
        browser = await engine.chromium.launch()

        async def local_only(route):
            host = urlparse(route.request.url).hostname
            if host in ("localhost", "127.0.0.1") and route.request.method in ("GET", "HEAD"):
                await route.continue_()
            else:
                await route.abort()

        for width in [1440, 390, 320]:
            context = await browser.new_context(
                viewport={"width": width, "height": 900},
                service_workers="block",
            )
            requests = []
            context.on("request", lambda request: requests.append(request.url))
            await context.route("**/*", local_only)
            page = await context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            response = await page.goto(base + "/", wait_until="networkidle")
            assert response.status == 200
            await page.locator("h1").wait_for()
            await page.wait_for_function("!document.body.classList.contains('is-loading')")
            assert await page.locator("iframe").count() == 0
            intro_link = page.locator(".profile-copy a")
            assert await intro_link.count() == 1
            assert await intro_link.get_attribute("href") == "/agentic-ai-workshop/"
            assert await intro_link.inner_text() == "Explore the workshop"
            assert await page.locator(".wave-pair button, .wave-pair figcaption").count() == 0
            assert await page.evaluate("document.documentElement.scrollWidth === innerWidth")
            assert not any(
                token in url for url in requests
                for token in ("/src/main.tsx", "/assets/app-", "/assets/firebase-", "/assets/react-")
            ), requests
            assert "Model Context Protocol (MCP)" in await page.locator(".profile-bio").inner_text()
            await page.locator(".profile-portrait").evaluate("(img) => img.decode()")
            await page.screenshot(path=str(output / f"home-{width}.png"), full_page=True)
            await page.add_script_tag(path=str(root / "node_modules/axe-core/axe.min.js"))
            for state in ["home", "current", "contact", "book"]:
                if state != "home":
                    await page.evaluate("(id) => location.hash=id", state)
                    await page.locator(f"#{state}.active").wait_for(state="visible")
                    await page.wait_for_function(
                        "(id) => getComputedStyle(document.getElementById(id)).opacity === '1'", arg=state
                    )
                assert await page.evaluate("document.documentElement.scrollWidth === innerWidth")
                assert await page.locator("select, [role=combobox], summary").count() == 0
                violations = await page.evaluate("""async () => {
                    const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});
                    return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));
                }""")
                report["accessibility"].append({"width": width, "state": state, "violations": violations})
                assert not violations, violations
            assert not errors, errors
            report["viewports"].append({"width": width, "direct_html": True, "no_app_bootstrap": True})
            await context.close()

        context = await browser.new_context(java_script_enabled=False, service_workers="block")
        await context.route("**/*", local_only)
        page = await context.new_page()
        for route in ["/", "/static/"]:
            await page.goto(base + route)
            assert await page.locator("h1").is_visible()
            assert await page.locator("#current").is_visible()
            assert await page.locator("#contact").is_visible()
            assert await page.locator(".video-launch").count() == 2
            assert (await page.locator(".wave-pair img").get_attribute("src")).endswith("adi-waving-still.webp")
        report["no_javascript"] = "Homepage and legacy copy expose biography, work, contact and video fallbacks."
        await context.close()

        context = await browser.new_context(service_workers="block")
        await context.route("**/*", local_only)
        page = await context.new_page()
        for route in ["/login/", "/progress/", "/lovesingy/", "/translate/", "/LOGIN", "/?/progress&day=today"]:
            await page.goto(base + route, wait_until="networkidle")
            await page.wait_for_url(lambda url: urlparse(url).path.rstrip("/") == "/login")
            await page.get_by_role("button", name="Log in with Google").wait_for()
            report["routes"].append({"input": route, "signed_out_destination": page.url})
        # Exercise a client-side history transition out of the React application.
        await page.evaluate("""() => {
            history.pushState(null,'','/');
            dispatchEvent(new PopStateEvent('popstate'));
        }""")
        await page.locator(".profile-bio").wait_for()
        assert await page.locator("#root").count() == 0
        assert await page.locator("iframe").count() == 0
        report["app_to_public_document"] = True
        for route in ["/Agentic-AI-Workshop?via=case#materials", "/?/Agentic-AI-Workshop&from=email~and~source=old#materials"]:
            await page.goto(base + route, wait_until="networkidle")
            await page.locator("#course-title").wait_for()
            assert urlparse(page.url).path == "/agentic-ai-workshop/"
            assert urlparse(page.url).fragment == "materials"
            report["routes"].append({"input": route, "destination": page.url})
        response = await page.goto(base + "/definitely-not-a-page/")
        assert response.status == 404
        assert await page.locator("h1").inner_text() == "Page not found"
        await page.wait_for_timeout(100)
        assert urlparse(page.url).path == "/definitely-not-a-page/"
        report["unknown_path"] = "Real HTTP 404; informative document; no SPA redirect."
        await context.close()

        context = await browser.new_context(service_workers="allow")
        await context.route("**/*", local_only)
        page = await context.new_page()
        await page.goto(base + "/", wait_until="networkidle")
        assert not await page.evaluate("!!navigator.serviceWorker.controller")
        await page.evaluate("""async () => {
            await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
        }""")
        await page.wait_for_function("!!navigator.serviceWorker.controller")
        await page.evaluate("""async () => {
            const cache=await caches.open('element-v2');
            await cache.put('/',new Response('<div id="root">OLD APP SHELL</div>',{headers:{'Content-Type':'text/html'}}));
            await cache.put('/unrelated-test-marker',new Response('PRESERVE'));
        }""")
        await page.reload(wait_until="networkidle")
        await page.locator(".profile-bio").wait_for()
        assert await page.locator("#root").count() == 0
        assert await page.evaluate("(async () => (await caches.match('/unrelated-test-marker')).text())()") == "PRESERVE"
        report["returning_service_worker"] = "Fresh static home replaces stale app HTML without clearing unrelated cached data."
        await context.close()
        await browser.close()
    (output / "checks.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"viewports": len(report["viewports"]), "route_cases": len(report["routes"]), "accessibility_states": len(report["accessibility"]), "status": "passed"}, indent=2))


asyncio.run(check())
