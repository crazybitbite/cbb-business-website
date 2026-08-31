"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

// Client component map for registered tools (metadata lives in lib/toolRegistry.ts).
// Each tool is dynamically imported so its code only loads on its own page.
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
    "json-beautifier": dynamic(() => import("./JsonBeautifier")),
    "xml-beautifier": dynamic(() => import("./XmlBeautifier")),
    "websocket-tester": dynamic(() => import("./WebSocketTester")),
    "socketio-tester": dynamic(() => import("./SocketIoTester")),
    "image-resizer": dynamic(() => import("./ImageResizer")),
    "js-compressor": dynamic(() => {
        return import("./CodeCompressor").then((m) => {
            const C = m.default
            return { default: () => <C language="js" /> }
        })
    }),
    "css-compressor": dynamic(() => {
        return import("./CodeCompressor").then((m) => {
            const C = m.default
            return { default: () => <C language="css" /> }
        })
    }),
    "post-data-receiver": dynamic(() => import("./PostDataReceiver")),
    "html-beautifier": dynamic(() => import("./HtmlBeautifier")),
    "sql-formatter": dynamic(() => import("./SqlFormatter")),
    "regex-tester": dynamic(() => import("./RegexTester")),
    "base64-encoder": dynamic(() => {
        return import("./EncoderTool").then((m) => {
            const C = m.default
            return { default: () => <C mode="base64" /> }
        })
    }),
    "url-encoder": dynamic(() => {
        return import("./EncoderTool").then((m) => {
            const C = m.default
            return { default: () => <C mode="url" /> }
        })
    }),
    "json-csv-converter": dynamic(() => import("./JsonCsvConverter")),
    "epoch-converter": dynamic(() => import("./EpochConverter")),
    "color-converter": dynamic(() => import("./ColorConverter")),
    "uuid-generator": dynamic(() => import("./UuidGenerator")),
    "password-generator": dynamic(() => import("./PasswordGenerator")),
    "hash-generator": dynamic(() => import("./HashGenerator")),
    "qr-generator": dynamic(() => import("./QrGenerator")),
    "lorem-generator": dynamic(() => import("./LoremGenerator")),
    "gradient-generator": dynamic(() => import("./GradientGenerator")),
    "box-shadow-generator": dynamic(() => import("./BoxShadowGenerator")),
    "number-base-converter": dynamic(() => import("./NumberBaseConverter")),
    "unit-converter": dynamic(() => import("./UnitConverter")),
    "case-converter": dynamic(() => import("./CaseConverter")),
    "jwt-decoder": dynamic(() => import("./JwtDecoder")),
    "html-entities": dynamic(() => import("./HtmlEntities")),
    "word-counter": dynamic(() => import("./WordCounter")),
    "text-diff": dynamic(() => import("./TextDiff")),
    "markdown-previewer": dynamic(() => import("./MarkdownPreviewer")),
    "slug-generator": dynamic(() => import("./SlugGenerator")),
    "cron-parser": dynamic(() => import("./CronParser")),
}
