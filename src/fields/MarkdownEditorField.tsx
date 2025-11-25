'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useField } from '@payloadcms/ui'
import dynamic from 'next/dynamic'
import { Copy, Check, Sparkles } from 'lucide-react'
import TurndownService from 'turndown'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Dynamically import the markdown editor and commands to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

// Import all commands dynamically (commented out since unused)
// const commands = dynamic(
//   () => import('@uiw/react-md-editor/commands').then((mod) => mod),
//   { ssr: false }
// )

export const MarkdownEditorField: React.FC = () => {
  const { value, setValue } = useField<string>()
  const [copied, setCopied] = useState(false)
  const [convertedFromHTML, setConvertedFromHTML] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize Turndown service for HTML to Markdown conversion
  const turndownService = useRef<TurndownService | null>(null)

  useEffect(() => {
    // Initialize Turndown with custom options
    turndownService.current = new TurndownService({
      headingStyle: 'atx', // Use # for headings
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
    })

    // Add custom rules for better conversion
    if (turndownService.current) {
      // Preserve line breaks
      turndownService.current.addRule('lineBreak', {
        filter: 'br',
        replacement: () => '  \n'
      })

      // Handle images better
      turndownService.current.addRule('image', {
        filter: 'img',
        replacement: (_content, node) => {
          const element = node as HTMLImageElement
          const alt = element.alt || 'image'
          const src = element.src || ''
          const title = element.title ? ` "${element.title}"` : ''
          return src ? `![${alt}](${src}${title})` : ''
        }
      })
    }
  }, [])

  // Handle copy to clipboard
  const handleCopyMarkdown = useCallback(async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy markdown:', err)
    }
  }, [value])

  // Handle paste events - convert HTML to Markdown
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!turndownService.current) return

      const clipboardData = e.clipboardData
      if (!clipboardData) return

      // Get both HTML and plain text from clipboard
      const htmlData = clipboardData.getData('text/html')
      // const textData = clipboardData.getData('text/plain') // Not used currently

      // If there's HTML content, convert it to markdown
      if (htmlData && htmlData.trim().length > 0) {
        try {
          e.preventDefault()

          // Convert HTML to Markdown
          const markdown = turndownService.current.turndown(htmlData)

          // Get the current textarea element
          const textarea = editorRef.current?.querySelector('textarea')
          if (textarea) {
            const start = textarea.selectionStart || 0
            const end = textarea.selectionEnd || 0
            const currentValue = value || ''

            // Insert markdown at cursor position
            const newValue =
              currentValue.substring(0, start) +
              markdown +
              currentValue.substring(end)

            setValue(newValue)

            // Show conversion notification
            setConvertedFromHTML(true)
            setTimeout(() => setConvertedFromHTML(false), 3000)

            // Set cursor position after inserted content
            setTimeout(() => {
              if (textarea) {
                const newPosition = start + markdown.length
                textarea.setSelectionRange(newPosition, newPosition)
                textarea.focus()
              }
            }, 0)
          }
        } catch (err) {
          console.error('Failed to convert HTML to Markdown:', err)
          // If conversion fails, allow default paste behavior
        }
      }
      // If no HTML, let default paste behavior handle plain text
    }

    // Add paste event listener to the editor
    const editorElement = editorRef.current
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste)
      return () => {
        editorElement.removeEventListener('paste', handlePaste)
      }
    }
    return undefined
  }, [value, setValue])

  return (
    <div className="field-type markdown-editor-field">
      {/* HTML Conversion Notification */}
      {convertedFromHTML && (
        <div className="conversion-notification">
          <Sparkles className="h-4 w-4" />
          <span>HTML content automatically converted to Markdown!</span>
        </div>
      )}

      {/* Help text */}
      <div className="markdown-help-banner">
        <div className="help-content">
          <div className="help-header">
            <div>
              <h4>✨ Smart Markdown Editor</h4>
              <p>
                Use the toolbar buttons to format your text. Changes appear in the preview on the right.
                <br />
                <strong>✨ Magic Paste:</strong> Copy content from ANY website and paste here - it will automatically convert to markdown!
                <br />
                <strong>Copy/Paste:</strong> You can also copy/paste markdown between editors - all formatting preserved!
                <br />
                Common shortcuts: <strong>Ctrl+B</strong> (bold), <strong>Ctrl+I</strong> (italic), <strong>Ctrl+K</strong> (link)
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="copy-button"
              disabled={!value}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="markdown-editor-wrapper" data-color-mode="light" ref={editorRef}>
        <MDEditor
          value={value || ''}
          onChange={(val) => setValue(val || '')}
          preview="live"
          height={600}
          visibleDragbar={true}
          highlightEnable={true}
          // Use all default commands which includes:
          // Bold, Italic, Strikethrough, HR, Headings (H1-H6),
          // Links, Quotes, Code, Images, Lists, Tables, etc.
          textareaProps={{
            placeholder: 'Start typing or use the toolbar buttons above to format your content...\n\n💡 TIP: You can paste markdown from anywhere and it will preserve all formatting!\n\nQuick examples:\n\n# Large Heading\n## Medium Heading\n### Small Heading\n\n**Bold text** or __Bold text__\n*Italic text* or _Italic text_\n~~Strikethrough~~\n\n- Bullet point 1\n- Bullet point 2\n  - Nested bullet\n\n1. Numbered item 1\n2. Numbered item 2\n\n> This is a quote or blockquote\n\n`Inline code snippet`\n\n```javascript\n// Code block\nconst example = "hello";\n```\n\n[Link text](https://example.com)\n\n![Image description](image-url.jpg)\n\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Data 1   | Data 2   | Data 3   |\n| Data 4   | Data 5   | Data 6   |\n\n---\n\nHorizontal line above',
            spellCheck: true,
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'off',
          }}
        />
      </div>

      {/* Quick reference guide */}
      <div className="markdown-quick-reference">
        <details>
          <summary>Markdown Quick Reference</summary>
          <div className="reference-grid">
            <div className="reference-item">
              <strong>Headers</strong>
              <code># H1<br />## H2<br />### H3</code>
            </div>
            <div className="reference-item">
              <strong>Emphasis</strong>
              <code>**bold**<br />*italic*<br />~~strikethrough~~</code>
            </div>
            <div className="reference-item">
              <strong>Lists</strong>
              <code>- Item 1<br />- Item 2<br />  - Nested<br /><br />1. Item 1<br />2. Item 2</code>
            </div>
            <div className="reference-item">
              <strong>Links & Images</strong>
              <code>[text](url)<br />![alt](image.jpg)</code>
            </div>
            <div className="reference-item">
              <strong>Code</strong>
              <code>`inline code`<br /><br />```<br />code block<br />```</code>
            </div>
            <div className="reference-item">
              <strong>Quotes & Tables</strong>
              <code>&gt; Quote<br /><br />| Col | Col |<br />|-----|-----|<br />| A   | B   |</code>
            </div>
          </div>
        </details>
      </div>

      <style jsx global>{`
        /* HTML Conversion Notification */
        .conversion-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(16, 185, 129, 0.2);
          font-size: 14px;
          font-weight: 600;
          animation: slideInRight 0.3s ease;
        }

        .conversion-notification svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Help Banner */
        .markdown-help-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 8px 8px 0 0;
          margin-bottom: 0;
        }

        .markdown-help-banner .help-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .markdown-help-banner .help-content h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .markdown-help-banner .help-content p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          opacity: 0.95;
        }

        .markdown-help-banner strong {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
        }

        /* Copy Button */
        .markdown-help-banner .copy-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .markdown-help-banner .copy-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
        }

        .markdown-help-banner .copy-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .markdown-help-banner .copy-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .markdown-help-banner .copy-button svg {
          width: 16px;
          height: 16px;
        }

        /* Editor Container */
        .markdown-editor-field .markdown-editor-wrapper {
          margin-top: 0;
        }

        .markdown-editor-field .w-md-editor {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0 0 8px 8px !important;
        }

        /* Toolbar Styling */
        .markdown-editor-field .w-md-editor-toolbar {
          background: linear-gradient(to bottom, #ffffff, #f9fafb) !important;
          border-bottom: 2px solid #e5e7eb !important;
          padding: 12px 12px !important;
          min-height: 48px !important;
        }

        .markdown-editor-field .w-md-editor-toolbar ul {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 4px !important;
        }

        .markdown-editor-field .w-md-editor-toolbar li {
          margin: 0 !important;
        }

        .markdown-editor-field .w-md-editor-toolbar button {
          color: #374151 !important;
          padding: 6px 8px !important;
          border-radius: 6px !important;
          transition: all 0.15s ease !important;
          font-size: 14px !important;
          min-width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .markdown-editor-field .w-md-editor-toolbar button:hover {
          background-color: #e0e7ff !important;
          color: #4f46e5 !important;
          transform: translateY(-1px);
        }

        .markdown-editor-field .w-md-editor-toolbar button[data-active="true"] {
          background-color: #4f46e5 !important;
          color: white !important;
        }

        .markdown-editor-field .w-md-editor-toolbar-divider {
          height: 24px !important;
          margin: 4px 8px !important;
          background-color: #d1d5db !important;
        }

        /* Content Areas */
        .markdown-editor-field .w-md-editor-content {
          background-color: white !important;
        }

        .markdown-editor-field .w-md-editor-input {
          background-color: #ffffff !important;
        }

        .markdown-editor-field .w-md-editor-text {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace !important;
          font-size: 14px !important;
          line-height: 1.7 !important;
          padding: 16px !important;
          color: #1f2937 !important;
        }

        .markdown-editor-field .w-md-editor-text-pre > code {
          font-family: inherit !important;
        }

        /* Preview Styling */
        .markdown-editor-field .w-md-editor-preview {
          background-color: #fafbfc !important;
          padding: 24px !important;
          border-left: 2px solid #e5e7eb !important;
        }

        .markdown-editor-field .wmde-markdown {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
          font-size: 15px !important;
          line-height: 1.7 !important;
          color: #1f2937 !important;
        }

        /* Headings in Preview */
        .markdown-editor-field .wmde-markdown h1 {
          font-size: 2.25em !important;
          margin-top: 0 !important;
          margin-bottom: 0.5em !important;
          font-weight: 700 !important;
          border-bottom: 2px solid #e5e7eb !important;
          padding-bottom: 0.3em !important;
          color: #111827 !important;
        }

        .markdown-editor-field .wmde-markdown h2 {
          font-size: 1.75em !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding-bottom: 0.3em !important;
          color: #111827 !important;
        }

        .markdown-editor-field .wmde-markdown h3 {
          font-size: 1.4em !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
          font-weight: 600 !important;
          color: #111827 !important;
        }

        .markdown-editor-field .wmde-markdown h4 {
          font-size: 1.15em !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }

        .markdown-editor-field .wmde-markdown h5 {
          font-size: 1em !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }

        .markdown-editor-field .wmde-markdown h6 {
          font-size: 0.9em !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
        }

        /* Paragraphs */
        .markdown-editor-field .wmde-markdown p {
          margin-bottom: 1em !important;
          line-height: 1.7 !important;
        }

        /* Blockquotes */
        .markdown-editor-field .wmde-markdown blockquote {
          border-left: 4px solid #f59e0b !important;
          background-color: #fffbeb !important;
          padding: 12px 20px !important;
          margin: 20px 0 !important;
          color: #78350f !important;
          border-radius: 0 6px 6px 0 !important;
        }

        .markdown-editor-field .wmde-markdown blockquote p {
          margin: 0 !important;
          font-style: italic !important;
        }

        /* Code */
        .markdown-editor-field .wmde-markdown code {
          background-color: #f3f4f6 !important;
          padding: 3px 8px !important;
          border-radius: 4px !important;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace !important;
          font-size: 0.9em !important;
          color: #db2777 !important;
          border: 1px solid #e5e7eb !important;
        }

        .markdown-editor-field .wmde-markdown pre {
          background-color: #1e293b !important;
          color: #e2e8f0 !important;
          padding: 20px !important;
          border-radius: 8px !important;
          overflow-x: auto !important;
          margin: 20px 0 !important;
          border: 1px solid #334155 !important;
        }

        .markdown-editor-field .wmde-markdown pre code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border: none !important;
          font-size: 0.9em !important;
        }

        /* Lists */
        .markdown-editor-field .wmde-markdown ul,
        .markdown-editor-field .wmde-markdown ol {
          padding-left: 32px !important;
          margin: 16px 0 !important;
        }

        .markdown-editor-field .wmde-markdown li {
          margin: 6px 0 !important;
          line-height: 1.6 !important;
        }

        .markdown-editor-field .wmde-markdown ul {
          list-style-type: disc !important;
        }

        .markdown-editor-field .wmde-markdown ul ul {
          list-style-type: circle !important;
        }

        .markdown-editor-field .wmde-markdown ul ul ul {
          list-style-type: square !important;
        }

        /* Tables */
        .markdown-editor-field .wmde-markdown table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 20px 0 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
        }

        .markdown-editor-field .wmde-markdown table th,
        .markdown-editor-field .wmde-markdown table td {
          border: 1px solid #e5e7eb !important;
          padding: 12px 16px !important;
          text-align: left !important;
        }

        .markdown-editor-field .wmde-markdown table th {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6) !important;
          font-weight: 600 !important;
          color: #111827 !important;
          text-transform: uppercase !important;
          font-size: 0.85em !important;
          letter-spacing: 0.05em !important;
        }

        .markdown-editor-field .wmde-markdown table tr:nth-child(even) {
          background-color: #f9fafb !important;
        }

        .markdown-editor-field .wmde-markdown table tr:hover {
          background-color: #f3f4f6 !important;
        }

        /* Links */
        .markdown-editor-field .wmde-markdown a {
          color: #4f46e5 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #c7d2fe !important;
          transition: all 0.2s ease !important;
        }

        .markdown-editor-field .wmde-markdown a:hover {
          color: #4338ca !important;
          border-bottom-color: #4f46e5 !important;
          background-color: #eef2ff !important;
        }

        /* Images */
        .markdown-editor-field .wmde-markdown img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px !important;
          margin: 20px 0 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }

        /* Horizontal Rule */
        .markdown-editor-field .wmde-markdown hr {
          border: none !important;
          border-top: 2px solid #e5e7eb !important;
          margin: 32px 0 !important;
        }

        /* Task Lists */
        .markdown-editor-field .wmde-markdown input[type="checkbox"] {
          margin-right: 8px !important;
          cursor: pointer !important;
        }

        /* Strong and Em */
        .markdown-editor-field .wmde-markdown strong {
          font-weight: 700 !important;
          color: #111827 !important;
        }

        .markdown-editor-field .wmde-markdown em {
          font-style: italic !important;
          color: #374151 !important;
        }

        /* Strikethrough */
        .markdown-editor-field .wmde-markdown del {
          text-decoration: line-through !important;
          opacity: 0.7 !important;
        }

        /* Quick Reference */
        .markdown-quick-reference {
          margin-top: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .markdown-quick-reference details {
          cursor: pointer;
        }

        .markdown-quick-reference summary {
          padding: 12px 16px;
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
          user-select: none;
          border-bottom: 1px solid #e5e7eb;
        }

        .markdown-quick-reference summary:hover {
          background-color: #f3f4f6;
        }

        .markdown-quick-reference .reference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          padding: 20px;
          background-color: white;
        }

        .markdown-quick-reference .reference-item {
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background-color: #fafbfc;
        }

        .markdown-quick-reference .reference-item strong {
          display: block;
          margin-bottom: 8px;
          color: #4f46e5;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .markdown-quick-reference .reference-item code {
          display: block;
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.6;
          font-family: 'Monaco', 'Menlo', monospace;
          white-space: pre-wrap;
        }

        /* Dragbar */
        .markdown-editor-field .w-md-editor-bar {
          cursor: row-resize !important;
          background-color: #e5e7eb !important;
          height: 6px !important;
        }

        .markdown-editor-field .w-md-editor-bar:hover {
          background-color: #4f46e5 !important;
        }
      `}</style>
    </div>
  )
}
