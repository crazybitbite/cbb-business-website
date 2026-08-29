// Metadata for all registered tools — importable from server code and the
// admin panel. The client component map lives in components/tools/registry.tsx.
//
// To add a new tool:
//   1. Create its component in components/tools/
//   2. Add one entry here and one in components/tools/registry.tsx
//   3. Create a page in the admin (slug tools/<sub-category>/<tool-name>),
//      pick the tool from the Tool dropdown, set its access rules. Done.

export interface ToolMeta {
    key: string
    label: string
    description: string
}

export const TOOLS: ToolMeta[] = [
    { key: "json-beautifier", label: "JSON Beautifier", description: "Format, minify, and validate JSON" },
    { key: "xml-beautifier", label: "XML Beautifier", description: "Format and validate XML documents" },
    { key: "websocket-tester", label: "WebSocket Tester", description: "Connect to a WebSocket server, send and receive messages" },
    { key: "socketio-tester", label: "Socket.IO Tester", description: "Connect to a Socket.IO server, emit and listen to events" },
    { key: "image-resizer", label: "Image Resizer", description: "Resize images in the browser and download the result" },
    { key: "js-compressor", label: "JavaScript Compressor", description: "Strip comments and whitespace from JavaScript" },
    { key: "css-compressor", label: "CSS Compressor", description: "Minify CSS stylesheets" },
    { key: "post-data-receiver", label: "POST Data Receiver", description: "Get a unique URL that captures incoming HTTP requests for inspection" },
]

export const toolByKey = (key: string | null | undefined): ToolMeta | undefined =>
    TOOLS.find((t) => t.key === key)
