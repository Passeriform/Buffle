import vitePluginBundleObfuscator from "vite-plugin-bundle-obfuscator"
import { defineConfig } from "vitest/config"

export default defineConfig({
    plugins: [vitePluginBundleObfuscator({
        options: {
            identifierNamesGenerator: "mangled-shuffled",
            forceTransformStrings: [
                "score",
                "moves",
            ],
            optionsPreset: "medium-obfuscation",
        },
    })],
})
