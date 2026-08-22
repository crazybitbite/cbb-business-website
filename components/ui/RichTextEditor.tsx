"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const config = useMemo(() => ({
    readonly: false,
    placeholder: placeholder || "Start typing...",
    theme: "dark",
    height: 500,
    toolbarSticky: false,
    buttons: [
      "source", "|",
      "bold", "italic", "underline", "strikethrough", "|",
      "superscript", "subscript", "|",
      "ul", "ol", "|",
      "outdent", "indent", "|",
      "font", "fontsize", "brush", "paragraph", "|",
      "image", "video", "table", "link", "|",
      "align", "undo", "redo", "|",
      "hr", "eraser", "copyformat", "|",
      "fullsize", "print", "about"
    ],
    extraButtons: ["code"],
    uploader: {
      insertImageAsBase64URI: true
    },
    style: {
      background: "rgba(255, 255, 255, 0.05)",
      color: "#fff",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    },
    toolbarAdaptive: false
  }), [placeholder])

  return (
    <div className="rich-text-editor-container">
      <style jsx global>{`
                .jodit-container {
                    border-radius: 0.5rem !important;
                    overflow: hidden !important;
                    background-color: transparent !important;
                }
                .jodit-toolbar__box {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .jodit-toolbar-button__button {
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                .jodit-toolbar-button__button:hover {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }
                .jodit-workplace {
                    background-color: #000 !important;
                    color: #fff !important;
                }
                .jodit-wysiwyg {
                    color: #fff !important;
                }
                .jodit-status-bar {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.5) !important;
                }
            `}</style>
      <JoditEditor
        value={value}
        config={config}
        onBlur={(newContent) => onChange(newContent)}
      />
    </div>
  )
}
