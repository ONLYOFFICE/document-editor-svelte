import { expect, test } from "@playwright/test";

const PRELOAD_PAGE_PATTERN = "**/web-apps/apps/api/documents/preload.html";

test("requests the preload page of the Document Server in a hidden iframe", async ({ page }) => {
    const requestedUrls: string[] = [];

    await page.route(PRELOAD_PAGE_PATTERN, async (route) => {
        requestedUrls.push(route.request().url());
        await route.fulfill({ contentType: "text/html", body: "<!doctype html><html></html>" });
    });

    await page.goto("/preload.html");

    const iframe = page.locator("iframe[title='onlyoffice-preload']");

    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute("tabindex", "-1");
    await expect(iframe).toHaveAttribute("aria-hidden", "true");
    await expect(iframe).toBeHidden();

    // The url of the component has no trailing slash: the component has to add it.
    await expect
        .poll(() => requestedUrls)
        .toEqual(["http://e2e-document-server.test/web-apps/apps/api/documents/preload.html"]);

    // Preloading must not pull in the DocsAPI script.
    await expect(page.locator("script#onlyoffice-api-script")).toHaveCount(0);
});
