# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright==1.58.0"]
# ///
"""Check recording controls locally; optionally exercise real YouTube playback."""

import argparse
import asyncio
import json
from pathlib import Path
import subprocess
from urllib.parse import parse_qs, urlparse

from playwright.async_api import async_playwright

MOCK_API = """
window.recordingTest = {players: {}, calls: [], copied: null, clipboardBlocked: false};
Object.defineProperty(navigator, 'clipboard', {value: {
  async writeText(text) {
    if (window.recordingTest.clipboardBlocked) throw new Error('Clipboard unavailable');
    window.recordingTest.copied = text;
  }
}});
window.YT = {
  Player: class {
    constructor(frame, options) {
      this.id = frame.id;
      this.time = Number(new URL(frame.src).searchParams.get('start') || 0);
      this.state = -1;
      this.options = options;
      this.autoplayBlocked = false;
      window.recordingTest.players[this.id] = this;
      setTimeout(() => options.events.onReady({target: this}), 0);
    }
    seekTo(time, allowSeekAhead) {
      this.time = time;
      window.recordingTest.calls.push({id:this.id, action:'seek', time, allowSeekAhead});
    }
    playVideo() {
      if (this.autoplayBlocked) return this.options.events.onAutoplayBlocked({target:this});
      this.state = 1;
      window.recordingTest.calls.push({id:this.id, action:'play'});
      this.options.events.onStateChange({target:this, data:1});
    }
    pauseVideo() {
      this.state = 2;
      this.options.events.onStateChange({target:this, data:2});
    }
    getCurrentTime() { return this.time; }
    getPlayerState() { return this.state; }
    fail() { this.options.events.onError({target:this, data:153}); }
  }
};
window.onYouTubeIframeAPIReady();
"""

EMBED_FIXTURE = """<!doctype html><html lang="en"><head><title>Local player fixture</title>
<style>body{background:#111827;color:#fff;font:16px sans-serif;padding:20px}</style>
</head><body><p>Local recording playback fixture</p></body></html>"""


async def fixture_route(route):
    url = urlparse(route.request.url)
    if url.hostname in ("127.0.0.1", "localhost"):
        await route.continue_()
    elif url.hostname == "www.youtube.com" and url.path == "/iframe_api":
        await route.fulfill(content_type="application/javascript", body=MOCK_API)
    elif url.hostname == "www.youtube-nocookie.com" and url.path.startswith("/embed/"):
        await route.fulfill(content_type="text/html", body=EMBED_FIXTURE)
    elif url.hostname == "www.youtube.com" and url.path == "/watch":
        await route.fulfill(content_type="text/html", body="<p>YouTube link fixture</p>")
    else:
        await route.abort()


async def local_check(browser, args, output):
    context = await browser.new_context(service_workers="block")
    await context.route("**/*", fixture_route)
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    archive = args.base_url + "/agentic-ai-workshop-2025/"
    await page.goto(archive, wait_until="networkidle")
    assert await page.locator("[data-session-recording]").count() == 3
    counts = [42, 26, 45]
    examples = [("restaurant", "homework"), ("memory", "sampling"), ("reviewer", "context")]
    placeholders = []
    for index, count in enumerate(counts, start=1):
        recording = page.locator(f"#session-{index}-recording")
        assert await recording.locator("[data-recording-seek]").count() == count
        assert await recording.locator("[data-recording-search]").is_visible()
        query = recording.locator("[data-recording-query]")
        placeholders.append(await query.get_attribute("placeholder"))
        for term in examples[index - 1]:
            await query.fill(term)
            assert await recording.locator("[data-recording-chapter]:visible").count() > 0
        await query.fill("")
    assert len(set(placeholders)) == 3, placeholders

    first = page.locator("#session-1-recording")
    await first.scroll_into_view_if_needed()
    await page.wait_for_function("!!window.recordingTest?.players['session-1-recording-player']")
    assert await first.locator("[data-recording-help]").inner_text() == "Select a chapter to play it here."
    assert await page.evaluate("window.recordingTest.calls.length") == 0, "Page load autoplayed"

    query = first.locator("[data-recording-query]")
    await query.fill("  HOMEWORK  ")
    assert await first.locator("[data-recording-chapter]:visible").count() == 1
    assert await first.locator("[data-recording-count]").inner_text() == "1 of 42 chapters"
    await query.fill("1:20:00")
    assert await first.locator("[data-recording-chapter]:visible").count() == 1
    await query.fill("no-such-topic-123")
    assert await first.locator("[data-recording-chapter]:visible").count() == 0
    assert await first.locator("[data-recording-empty]").is_visible()
    await query.fill("")
    assert await first.locator("[data-recording-chapter]:visible").count() == 42

    chapter = first.locator('[data-recording-seek="2280"]')
    await chapter.focus()
    await page.keyboard.press("Enter")
    assert len(context.pages) == 1, "Ready chapter navigation opened a new page"
    assert await page.evaluate("window.recordingTest.players['session-1-recording-player'].time") == 2280
    assert await chapter.get_attribute("aria-current") == "true"
    assert "t=2280s" in await first.locator("[data-recording-youtube]").get_attribute("href")

    await page.evaluate("window.recordingTest.players['session-1-recording-player'].time = 2287.9")
    await first.locator("[data-recording-share]").click()
    copied = await page.evaluate("window.recordingTest.copied")
    query_string = parse_qs(urlparse(copied).query)
    assert query_string == {"recording": ["session-1-recording"], "t": ["2287"]}
    assert urlparse(copied).fragment == "session-1-recording"
    await page.goto(copied, wait_until="networkidle")
    await page.wait_for_function("!!window.recordingTest?.players['session-1-recording-player']")
    assert await page.evaluate("window.recordingTest.players['session-1-recording-player'].time") == 2287
    assert await page.evaluate("window.recordingTest.calls.length") == 0
    assert "start=2287" in await first.locator("iframe").get_attribute("src")
    assert urlparse(await first.locator("iframe").get_attribute("src")).query

    # YouTube can report zero for a cued video before the viewer presses Play.
    await page.evaluate("window.recordingTest.players['session-1-recording-player'].time = 0")
    await page.evaluate("window.recordingTest.clipboardBlocked = true")
    await first.locator("[data-recording-share]").click()
    assert await first.locator("[data-recording-share-url]").is_visible()
    assert await first.locator("[data-recording-share-url]").input_value() == copied

    await first.locator('[data-recording-seek="4800"]').click()
    second = page.locator("#session-2-recording")
    await second.scroll_into_view_if_needed()
    await page.wait_for_function("!!window.recordingTest?.players['session-2-recording-player']")
    await second.locator('[data-recording-query]').fill("vector databases")
    assert await second.locator("[data-recording-chapter]:visible").count() == 1
    await second.locator('[data-recording-seek="3150"]').click()
    assert await page.evaluate("window.recordingTest.players['session-1-recording-player'].state") == 2
    assert await page.evaluate("window.recordingTest.players['session-2-recording-player'].time") == 3150

    third = page.locator("#session-3-recording")
    await third.scroll_into_view_if_needed()
    await page.wait_for_function("!!window.recordingTest?.players['session-3-recording-player']")
    await third.locator('[data-recording-query]').fill("producer reviewer")
    assert await third.locator("[data-recording-chapter]:visible").count() == 1
    await page.evaluate("window.recordingTest.players['session-3-recording-player'].autoplayBlocked = true")
    await third.locator('[data-recording-seek="3180"]').click()
    assert "Press Play" in await third.locator("[data-recording-status]").inner_text()
    assert "t=3180s" in await third.locator("[data-recording-youtube]").get_attribute("href")
    await page.evaluate("window.recordingTest.players['session-3-recording-player'].fail()")
    assert not await third.locator("[data-recording-share]").is_visible()
    async with context.expect_page() as popup:
        await third.locator('[data-recording-seek="3180"]').click()
    youtube_page = await popup.value
    await youtube_page.wait_for_load_state()
    assert parse_qs(urlparse(youtube_page.url).query) == {"v": ["4YrRODYnYHY"], "t": ["3180s"]}
    await youtube_page.close()

    reflow = []
    axe = Path(__file__).resolve().parents[1] / "node_modules/axe-core/axe.min.js"
    for width in [1440, 768, 390, 320]:
        await page.set_viewport_size({"width": width, "height": 1000})
        await first.scroll_into_view_if_needed()
        assert await page.evaluate("document.documentElement.scrollWidth === innerWidth")
        box = await first.locator("iframe").bounding_box()
        assert box["width"] >= 200 and box["height"] >= 200, box
        await page.add_script_tag(path=str(axe))
        violations = await page.evaluate("""async () => (await axe.run(
          document.getElementById('recordings'),
          {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}
        )).violations.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.map(n=>n.target)}))""")
        assert not violations, (width, violations)
        reflow.append({"width": width, "player": box, "axe_violations": 0})
        if width in (1440, 390):
            await page.locator("#recordings").screenshot(path=str(output / f"recordings-{width}.png"))
    assert not errors, errors
    await context.close()

    native = await browser.new_context(java_script_enabled=False, service_workers="block")
    await native.route("**/*", fixture_route)
    page = await native.new_page()
    await page.goto(archive)
    assert await page.locator("[data-recording-seek]").count() == sum(counts)
    assert await page.locator("[data-recording-query]:visible").count() == 0
    async with native.expect_page() as popup:
        await page.locator('#session-1-recording [data-recording-seek="4800"]').click()
    youtube_page = await popup.value
    await youtube_page.wait_for_load_state()
    assert parse_qs(urlparse(youtube_page.url).query) == {"v": ["jNj2PI5A6zQ"], "t": ["4800s"]}
    await native.close()
    return {
        "chapters": counts,
        "keyboard_seek": True,
        "search": True,
        "episode_search_examples": placeholders,
        "shared_timestamp": True,
        "clipboard_fallback": True,
        "one_playing_video": True,
        "autoplay_blocked_fallback": True,
        "embed_error_fallback": True,
        "no_javascript_links": True,
        "reflow": reflow,
        "page_errors": errors,
    }


async def live_check(browser, args, output):
    context = await browser.new_context(service_workers="block")
    page = await context.new_page()
    await page.goto(args.base_url + "/agentic-ai-workshop-2025/", wait_until="domcontentloaded")
    results = []
    for index, target in [(1, 2280), (2, 3150), (3, 3180)]:
        recording = page.locator(f"#session-{index}-recording")
        await recording.scroll_into_view_if_needed()
        await page.wait_for_function(
            """(id) => document.querySelector(`#${id} [data-recording-help]`).textContent.includes('play it here')""",
            arg=f"session-{index}-recording",
            timeout=30000,
        )
        await recording.locator(f'[data-recording-seek="{target}"]').click()
        video = page.frame_locator(f"#session-{index}-recording-player").locator("video")
        await video.wait_for(timeout=30000)
        await page.wait_for_timeout(2500)
        playback = await video.evaluate("(video) => ({time:video.currentTime, paused:video.paused, ready:video.readyState, error:video.error?.code})")
        result = {"session": index, "requested_time": target, **playback}
        results.append(result)
        await recording.screenshot(path=str(output / f"live-session-{index}.png"))
        (output / "live-playback.json").write_text(json.dumps(results, indent=2))
        assert not playback["paused"] and playback["ready"] >= 2 and abs(playback["time"] - target) < 10, result
    await context.close()
    return results


async def current_year_check(browser, args, output):
    root = Path(__file__).resolve().parents[1]
    renderer = """
      import {readFile} from 'node:fs/promises';
      import {renderWorkshop, course, sessionRecordings, historicalRecordings} from './dist-ssr/workshop/render.mjs';
      const generated = await readFile('dist/agentic-ai-workshop/index.html', 'utf8');
      const stylesheet = /rel="stylesheet" href="([^"]+)"/.exec(generated)[1];
      const recordings = sessionRecordings.map(recording => ({
        ...recording, youtubeId: historicalRecordings[0].youtubeId
      }));
      process.stdout.write(renderWorkshop(course.path, stylesheet, course.state, recordings));
    """
    html = subprocess.run(
        ["node", "--input-type=module", "-e", renderer],
        cwd=root, capture_output=True, text=True, check=True,
    ).stdout
    context = await browser.new_context(service_workers="block")
    await context.route("**/*", fixture_route)

    async def document_fixture(route):
        await route.fulfill(content_type="text/html", body=html)

    await context.route(args.base_url + "/agentic-ai-workshop/**", document_fixture)
    page = await context.new_page()
    await page.goto(args.base_url + "/agentic-ai-workshop/", wait_until="networkidle")
    recording = page.locator("#session-1-recording")
    await recording.scroll_into_view_if_needed()
    await page.wait_for_function("!!window.recordingTest?.players['session-1-recording-player']")
    assert await recording.locator("[data-recording-seek]").count() == 43
    query = recording.locator("[data-recording-query]")
    assert await query.get_attribute("placeholder") == "Try “caching” or “homework”"
    await query.fill("caching")
    assert await recording.locator("[data-recording-chapter]:visible").count() == 2
    await query.fill("homework")
    assert await recording.locator("[data-recording-chapter]:visible").count() == 1
    await recording.locator('[data-recording-seek="4899"]').click()
    assert await page.evaluate("window.recordingTest.players['session-1-recording-player'].time") == 4899
    await query.fill("")
    await page.evaluate("document.fonts.ready")
    typography = await recording.locator("h3").evaluate("""heading => ({
      family:getComputedStyle(heading).fontFamily,
      weight:getComputedStyle(heading).fontWeight
    })""")
    assert "Workshop Subhead" in typography["family"] and typography["weight"] == "400", typography
    axe = root / "node_modules/axe-core/axe.min.js"
    reflow = []
    for width in [1440, 768, 390, 320]:
        await page.set_viewport_size({"width": width, "height": 1000})
        await recording.scroll_into_view_if_needed()
        assert await page.evaluate("document.documentElement.scrollWidth === innerWidth")
        await page.add_script_tag(path=str(axe))
        violations = await page.evaluate("""async () => (await axe.run(
          document.getElementById('recordings'),
          {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}
        )).violations.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.map(n=>n.target)}))""")
        assert not violations, (width, violations)
        reflow.append({"width": width, "axe_violations": 0})
        if width in (1440, 390):
            await recording.screenshot(path=str(output / f"2026-recording-{width}.png"))
    await context.close()
    return {"chapters": 43, "seek": True, "episode_search_examples": True, "typography": typography, "reflow": reflow}


async def main(args):
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as engine:
        browser = await engine.chromium.launch(
            headless=True,
            **({"executable_path": args.browser_executable} if args.browser_executable else {}),
        )
        report = {"base_url": args.base_url}
        if args.live:
            report["live"] = await live_check(browser, args, output)
        else:
            report["local"] = await local_check(browser, args, output)
            report["current_year_fixture"] = await current_year_check(browser, args, output)
        await browser.close()
    (output / "recording-checks.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:4174")
    parser.add_argument("--output", default="temp/workshop-recordings")
    parser.add_argument("--browser-executable")
    parser.add_argument("--live", action="store_true")
    asyncio.run(main(parser.parse_args()))
