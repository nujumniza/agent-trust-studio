"""E2E: switch to Real mode, launch a real run, verify trace, scoring, persistence, history, feedback."""
import asyncio, sys
from playwright.async_api import async_playwright, expect
BASE = "http://localhost:8080"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        pg = await (await b.new_context(viewport={"width":1280,"height":1800})).new_page()
        await pg.goto(BASE + "/run", wait_until="networkidle")
        real = pg.get_by_role("button", name="Real evaluation")
        launch = pg.get_by_role("button", name="Launch real run")
        # click until hydrated handlers switch mode
        for _ in range(20):
            await real.click()
            if await launch.count(): break
            await pg.wait_for_timeout(500)
        await expect(launch).to_be_visible(); await expect(launch).to_be_enabled()
        await expect(pg.get_by_text("openai/gpt-6-astra (via Lovable AI)")).to_be_attached()
        print("PASS launch button visible+enabled in real mode")
        await launch.click()
        await pg.wait_for_url("**/dashboard/*-*-*", timeout=170000)
        await pg.wait_for_selector("text=Recorded trace events", timeout=60000)
        await pg.screenshot(path="/tmp/browser/real/dash.png")
        body = await pg.inner_text("main")
        print("URL", pg.url); open("/tmp/browser/real/dash.txt","w").write(body)
        for s in ["tool_error · check_inventory","[injected fault]","tool_result · check_inventory","agent: openai/gpt-6-astra"]:
            print(("PASS " if s in body else "FAIL ") + s)
        print("STATUS line:", [l for l in body.splitlines() if "status:" in l][:1])
        await pg.get_by_role("textbox").last.fill("E2E test feedback")
        await pg.get_by_role("button", name="Submit feedback").click()
        await expect(pg.get_by_text("Feedback recorded.")).to_be_visible(timeout=15000)
        print("PASS feedback saved")
        runid = pg.url.rsplit("/",1)[1][:8]
        await pg.goto(BASE + "/history", wait_until="networkidle")
        await expect(pg.get_by_text(runid)).to_be_visible(timeout=15000)
        print("PASS history lists", runid)
        await b.close()
asyncio.run(main())
