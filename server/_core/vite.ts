import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  // The embedded full-stack preview is served through a proxy that does not
  // expose Vite's HMR socket. Disable HMR there unless explicitly requested,
  // while ordinary local development keeps Vite HMR enabled automatically.
  const managedPreview = Boolean(process.env.MANUS_WEBDEV_PROJECT_ID);
  const hmrEnabled = !managedPreview || process.env.MANUS_ENABLE_HMR === "true";
  const serverOptions = {
    middlewareMode: true,
    hmr: hmrEnabled ? { server } : false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  if (!hmrEnabled) {
    app.get("/@vite/client", (_req, res) => {
      res.status(200).type("application/javascript").send(`
        export function createHotContext() {
          return { accept() {}, dispose() {}, prune() {}, on() {}, off() {}, send() {}, invalidate() {} };
        }
        export function updateStyle(id, css) {
          if (typeof document === "undefined") return;
          let style = document.querySelector('style[data-vite-dev-id="' + id + '"]');
          if (!style) {
            style = document.createElement("style");
            style.setAttribute("data-vite-dev-id", id);
            document.head.appendChild(style);
          }
          style.textContent = css;
        }
        export function removeStyle(id) {
          document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove();
        }
      `);
    });
  }
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);
      if (!hmrEnabled) {
        page = page.replace('<script type="module" src="/@vite/client"></script>', "");
      }
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
