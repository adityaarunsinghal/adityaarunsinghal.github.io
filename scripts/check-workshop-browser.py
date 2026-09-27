# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright==1.58.0"]
# ///
"""Exercise local workshop documents without submitting forms or contacting backends."""

import argparse
import asyncio
import json
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import async_playwright


async def check(args):
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    report = {
        "base_url": args.base_url,
        "viewports": [],
        "routes": [],
        "accessibility": [],
    }
    root = Path(__file__).resolve().parents[1]
    axe = root / "node_modules/axe-core/axe.min.js"
    async with async_playwright() as engine:
        browser = await engine.chromium.launch(
            headless=True,
            **(
                {"executable_path": args.browser_executable}
                if args.browser_executable
                else {}
            ),
        )
        context = await browser.new_context(service_workers="block")

        async def local_only(route):
            request = route.request
            if request.method not in ("GET", "HEAD") or urlparse(
                request.url
            ).hostname not in ("127.0.0.1", "localhost"):
                await route.abort()
            else:
                await route.continue_()

        await context.route("**/*", local_only)
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        for route in [
            "/agentic-ai-workshop",
            "/agentic-ai-workshop/",
            "/agentic-ai-workshop-2025",
            "/agentic-ai-workshop-2025/",
            "/registration-form",
            "/agentic-ai-workshop/registration-form/",
            "/agentic-ai-workshop/feedback",
            "/agentic-ai-workshop-2025/feedback/",
            "/agentic-ai-workshop-2025/registration-form/",
        ]:
            response = await page.goto(args.base_url + route, wait_until="networkidle")
            assert response.status == 200, (route, response.status)
            assert await page.locator("h1").count() == 1
            assert await page.locator("script").count() == 0
            report["routes"].append(
                {"route": route, "status": response.status, "final_url": page.url}
            )

        for year, route in [
            (2026, "/agentic-ai-workshop/"),
            (2025, "/agentic-ai-workshop-2025/"),
        ]:
            for width, height in [(1440, 1000), (768, 1024), (390, 844), (320, 844)]:
                await page.set_viewport_size({"width": width, "height": height})
                await page.goto(args.base_url + route, wait_until="networkidle")
                metrics = await page.evaluate(
                    """() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,animations:document.getAnimations().filter(a=>a.playState==='running').length,mainVisible:document.querySelector('main').getBoundingClientRect().height>0})"""
                )
                assert metrics["width"] == metrics["scrollWidth"], (
                    year,
                    width,
                    metrics,
                )
                assert metrics["animations"] == 0
                assert metrics["mainVisible"]
                if year == 2026:
                    button = await page.locator(
                        ".hero-copy .course-button"
                    ).bounding_box()
                    deadline = await page.locator(".registration-note").bounding_box()
                    illustration = await page.locator(
                        ".briefing-example"
                    ).bounding_box()
                    if width <= 390:
                        assert deadline["y"] + deadline["height"] < height, (
                            "deadline below first screen",
                            width,
                            deadline,
                        )
                        assert button["y"] < illustration["y"]
                report["viewports"].append({"year": year, **metrics})
                if width in (1440, 390):
                    await page.screenshot(path=str(output / f"{year}-{width}-hero.png"))
                    await page.screenshot(
                        path=str(output / f"{year}-{width}-full.png"), full_page=True
                    )
                if width == 1440 and year == 2026:
                    await page.locator("#schedule").scroll_into_view_if_needed()
                    await page.screenshot(
                        path=str(output / "2026-desktop-schedule.png")
                    )
                    await page.locator(".demo-section").scroll_into_view_if_needed()
                    await page.screenshot(path=str(output / "2026-desktop-demo.png"))
                await page.add_script_tag(path=str(axe))
                results = await page.evaluate(
                    """async () => { const r = await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}); return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>v.id)}; }"""
                )
                report["accessibility"].append(
                    {"year": year, "width": width, **results}
                )
            # A fully expanded archive must reflow as well.
            if year == 2025:
                await page.locator(".archive-quotes summary").click()
                assert await page.evaluate(
                    "document.documentElement.scrollWidth === innerWidth"
                )
                assert await page.locator(".archive-quotes li").count() > 0
            await page.emulate_media(reduced_motion="reduce")
            assert (
                await page.evaluate(
                    "document.getAnimations().filter(a=>a.playState==='running').length"
                )
                == 0
            )

        await page.goto(
            args.base_url + "/agentic-ai-workshop/", wait_until="networkidle"
        )
        await page.keyboard.press("Tab")
        assert (
            await page.evaluate("document.activeElement.className")
            == "workshop-skip-link"
        )
        await page.keyboard.press("Enter")
        assert page.url.endswith("#main-content")
        disclosure = page.locator(".example-mechanism summary")
        await disclosure.focus()
        await page.keyboard.press("Enter")
        assert (
            await page.locator(".example-mechanism").get_attribute("open") is not None
        )
        await page.keyboard.press("Enter")
        assert await page.locator(".example-mechanism").get_attribute("open") is None
        await page.locator(
            '.course-header a[href="/agentic-ai-workshop-2025/"]'
        ).click()
        assert "2025" in await page.title()
        await page.go_back()
        assert "2026" in await page.title()
        await page.goto(
            args.base_url + "/agentic-ai-workshop?from=email#materials",
            wait_until="networkidle",
        )
        assert "from=email" in page.url and page.url.endswith("#materials")

        # The installed SPA router accepts case variants and repeated trailing slashes.
        report["compatibility"] = []
        for variant in [
            "/Agentic-AI-Workshop?via=case#materials",
            "/agentic-ai-workshop//?via=slashes#schedule",
            "/?/Agentic-AI-Workshop&from=email~and~source=old#materials",
            "/Agentic-AI-Workshop-2025?via=archive",
            "/REGISTRATION-FORM?via=alias",
        ]:
            await page.goto(args.base_url + variant, wait_until="networkidle")
            assert "/404" not in page.url
            assert "Workshop" in await page.title()
            assert "via=" in page.url or "from=email&source=old" in page.url
            report["compatibility"].append({"input": variant, "output": page.url})

        await page.set_viewport_size({"width": 1440, "height": 1000})
        for route in ["/agentic-ai-workshop/", "/agentic-ai-workshop-2025/"]:
            await page.goto(args.base_url + route)
            await page.evaluate("""() => {
                const elements = [...document.querySelectorAll('body *')];
                const sizes = elements.map(e => parseFloat(getComputedStyle(e).fontSize));
                elements.forEach((e,i) => e.style.fontSize = `${sizes[i]*2}px`);
            }""")
            assert await page.evaluate(
                "document.documentElement.scrollWidth === innerWidth"
            )
        report["double_text_reflow"] = True

        await context.close()
        nojs = await browser.new_context(
            java_script_enabled=False,
            viewport={"width": 390, "height": 844},
            service_workers="block",
        )
        await nojs.route("**/*", local_only)
        nojs_page = await nojs.new_page()
        for route in ["/agentic-ai-workshop/", "/agentic-ai-workshop-2025/"]:
            await nojs_page.goto(args.base_url + route)
            assert await nojs_page.locator("h1").is_visible()
            assert await nojs_page.locator('a[href^="https://"]').count() > 0
        await nojs.close()

        returning = await browser.new_context(service_workers="allow")
        await returning.route("**/*", local_only)
        page = await returning.new_page()
        await page.goto(args.base_url + "/", wait_until="networkidle")
        await (
            page.frame_locator("iframe")
            .locator('a[href="/agentic-ai-workshop/"]')
            .click()
        )
        await page.wait_for_url("**/agentic-ai-workshop/")
        assert await page.locator("#course-title").is_visible()
        assert len(page.frames) == 1
        report["homepage_iframe_escape"] = True
        await page.evaluate("""async () => {
            await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
        }""")
        await page.reload(wait_until="networkidle")
        assert await page.evaluate("!!navigator.serviceWorker.controller")
        # Only this isolated browser context is seeded; no live user cache is changed.
        await page.evaluate("""async () => {
            const cache = await caches.open('element-v2');
            await cache.put('/agentic-ai-workshop/', new Response('STALE WORKSHOP'));
            await cache.put('/unrelated-test-marker', new Response('PRESERVE'));
        }""")
        await page.reload(wait_until="networkidle")
        assert await page.locator("#course-title").is_visible()
        assert (
            await page.evaluate("""async () =>
            await (await caches.match('/unrelated-test-marker')).text()
        """)
            == "PRESERVE"
        )
        report["service_worker_network_first"] = True
        report["signed_out_routes"] = []
        for route in ["/login", "/progress", "/lovesingy", "/translate"]:
            await page.goto(args.base_url + route, wait_until="networkidle")
            await page.wait_for_url("**/login")
            report["signed_out_routes"].append(
                {"route": route, "destination": page.url}
            )
        await returning.close()
        await browser.close()
    report["errors"] = errors
    (output / "browser-checks.json").write_text(json.dumps(report, indent=2))
    violations = sum(len(item["violations"]) for item in report["accessibility"])
    print(
        json.dumps(
            {
                "routes": len(report["routes"]),
                "viewports": len(report["viewports"]),
                "axe_violations": violations,
                "page_errors": errors,
                "output": str(output),
            },
            indent=2,
        )
    )
    assert not errors
    assert violations == 0, "See browser-checks.json for accessibility violations"


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--base-url", default="http://127.0.0.1:4173")
parser.add_argument("--output", default="temp/workshop-browser")
parser.add_argument("--browser-executable")
asyncio.run(check(parser.parse_args()))
