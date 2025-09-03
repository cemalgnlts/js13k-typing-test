import readline from "node:readline";

import { context } from "esbuild";

const isDev = process.env.prod === "dev";

const ctx = await context({
    entryPoints: ["src/main.js"],
    outdir: "game",
    format: "esm",
    bundle: true,
    minify: !isDev,
    define: {
        "DEV": String(isDev)
    },
    loader: {
        ".svg": "text"
    }
});

if (!isDev) {
    await ctx.rebuild();
    await ctx.dispose();
    console.log("Success");
} else {
    await ctx.watch({
        delay: 250
    });

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on("keypress", async () => {
        await ctx.dispose();
        console.log("Completed.");
        process.exit(0);
    });

    console.log("Watching... Press any key to exit.");
}