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
}
