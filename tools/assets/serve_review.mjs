// Standalone asset QA server; does not depend on the unfinished game entrypoint.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../public/", import.meta.url));
const mime = {
    ".html": "text/html; charset=utf-8",
    ".json": "application/json",
    ".webp": "image/webp",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};
const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url, "http://127.0.0.1");
        const path = resolve(
            root,
            "." + decodeURIComponent(url.pathname === "/" ? "/asset-review.html" : url.pathname),
        );
        if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) {
            response.writeHead(403).end();
            return;
        }
        const body = await readFile(path);
        response.writeHead(200, {
            "Content-Type": mime[extname(path)] ?? "application/octet-stream",
        });
        response.end(body);
    } catch {
        response.writeHead(404).end("Asset not found");
    }
});
const port = Number(process.argv[2] ?? 8767);
server.listen(port, "127.0.0.1", () =>
    console.log(`Asset review: http://127.0.0.1:${port}/asset-review.html`),
);
