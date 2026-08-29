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
    { key: "html-beautifier", label: "HTML Beautifier", description: "Format and minify HTML markup" },
    { key: "sql-formatter", label: "SQL Formatter", description: "Format SQL queries with uppercase keywords and clean indentation" },
    { key: "regex-tester", label: "Regex Tester", description: "Test regular expressions with live match highlighting and capture groups" },
    { key: "base64-encoder", label: "Base64 Encoder / Decoder", description: "Encode text to Base64 and decode it back" },
    { key: "url-encoder", label: "URL Encoder / Decoder", description: "Percent-encode and decode URL components" },
    { key: "json-csv-converter", label: "JSON ⇄ CSV Converter", description: "Convert JSON arrays to CSV and back" },
    { key: "epoch-converter", label: "Epoch / Timestamp Converter", description: "Convert Unix timestamps to human dates and back" },
    { key: "color-converter", label: "Color Converter", description: "Convert colors between HEX, RGB, and HSL with live preview" },
    { key: "uuid-generator", label: "UUID Generator", description: "Generate version 4 UUIDs in bulk" },
    { key: "password-generator", label: "Password Generator", description: "Generate strong random passwords with custom rules" },
    { key: "hash-generator", label: "Hash Generator", description: "Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes" },
    { key: "qr-generator", label: "QR Code Generator", description: "Turn any text or URL into a downloadable QR code" },
    { key: "lorem-generator", label: "Lorem Ipsum Generator", description: "Generate placeholder paragraphs for designs and mockups" },
]

export const toolByKey = (key: string | null | undefined): ToolMeta | undefined =>
    TOOLS.find((t) => t.key === key)
