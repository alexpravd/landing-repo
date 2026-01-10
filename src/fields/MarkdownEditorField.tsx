'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useField, useTheme } from '@payloadcms/ui'
import dynamic from 'next/dynamic'
import { Copy, Check, Wand2, ChevronDown, ChevronUp } from 'lucide-react'
import TurndownService from 'turndown'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default), {
  ssr: false,
})

export const MarkdownEditorField: React.FC = () => {
  const { value, setValue } = useField<string>()
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [convertedFromHTML, setConvertedFromHTML] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [localValue, setLocalValue] = useState(value || '')
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  // Determine color mode based on Payload theme
  const colorMode = theme === 'dark' ? 'dark' : 'light'

  // Sync local value with Payload value (only when Payload changes externally)
  useEffect(() => {
    if (!isInternalChange.current && value !== localValue) {
      setLocalValue(value || '')
    }
    isInternalChange.current = false
  }, [value])

  // Handle editor change - update local state immediately, debounce Payload update
  const handleChange = useCallback(
    (val: string | undefined) => {
      const newVal = val || ''
      setLocalValue(newVal)
      isInternalChange.current = true
      setValue(newVal)
    },
    [setValue]
  )

  // Initialize Turndown service for HTML to Markdown conversion
  const turndownService = useRef<TurndownService | null>(null)

  useEffect(() => {
    turndownService.current = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
    })

    if (turndownService.current) {
      turndownService.current.addRule('lineBreak', {
        filter: 'br',
        replacement: () => '  \n',
      })

      turndownService.current.addRule('image', {
        filter: 'img',
        replacement: (_content, node) => {
          const element = node as HTMLImageElement
          const alt = element.alt || 'image'
          const src = element.src || ''
          const title = element.title ? ` "${element.title}"` : ''
          return src ? `![${alt}](${src}${title})` : ''
        },
      })
    }
  }, [])

  const handleCopyMarkdown = useCallback(async () => {
    if (!localValue) return
    try {
      await navigator.clipboard.writeText(localValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy markdown:', err)
    }
  }, [localValue])

  // Handle paste events - convert HTML to Markdown
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!turndownService.current) return

      const clipboardData = e.clipboardData
      if (!clipboardData) return

      const htmlData = clipboardData.getData('text/html')

      if (htmlData && htmlData.trim().length > 0) {
        try {
          e.preventDefault()
          const markdown = turndownService.current.turndown(htmlData)

          const textarea = editorRef.current?.querySelector('textarea')
          if (textarea) {
            const start = textarea.selectionStart || 0
            const end = textarea.selectionEnd || 0
            const currentValue = localValue || ''

            const newValue =
              currentValue.substring(0, start) + markdown + currentValue.substring(end)

            handleChange(newValue)
            setConvertedFromHTML(true)
            setTimeout(() => setConvertedFromHTML(false), 3000)

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
        }
      }
    }

    const editorElement = editorRef.current
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste)
      return () => {
        editorElement.removeEventListener('paste', handlePaste)
      }
    }
    return undefined
  }, [localValue, handleChange])

  return (
    <div className="payload-markdown-editor">
      {/* Conversion Toast */}
      {convertedFromHTML && (
        <div className="conversion-toast">
          <Wand2 size={14} />
          <span>HTML converted to Markdown</span>
        </div>
      )}

      {/* Compact Header */}
      <div className="editor-header">
        <div className="header-left">
          <span className="editor-label">Markdown Editor</span>
          <button type="button" className="help-toggle" onClick={() => setShowHelp(!showHelp)}>
            {showHelp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>Help</span>
          </button>
        </div>
        <div className="header-actions">
          <span className="paste-hint">
            <Wand2 size={12} />
            Paste HTML to auto-convert
          </span>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="copy-btn"
            disabled={!localValue}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Help */}
      {showHelp && (
        <div className="help-panel">
          <div className="help-grid">
            <div className="help-item">
              <code># Heading 1</code>
              <code>## Heading 2</code>
            </div>
            <div className="help-item">
              <code>**bold**</code>
              <code>*italic*</code>
            </div>
            <div className="help-item">
              <code>- list item</code>
              <code>1. numbered</code>
            </div>
            <div className="help-item">
              <code>[link](url)</code>
              <code>![alt](img)</code>
            </div>
            <div className="help-item">
              <code>`code`</code>
              <code>&gt; quote</code>
            </div>
            <div className="help-item">
              <code>---</code>
              <code>| table |</code>
            </div>
          </div>
          <div className="shortcuts">
            <span>
              <kbd>Ctrl</kbd>+<kbd>B</kbd> Bold
            </span>
            <span>
              <kbd>Ctrl</kbd>+<kbd>I</kbd> Italic
            </span>
            <span>
              <kbd>Ctrl</kbd>+<kbd>K</kbd> Link
            </span>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className={`editor-container ${colorMode}`} data-color-mode={colorMode} ref={editorRef}>
        <MDEditor
          value={localValue}
          onChange={handleChange}
          preview="live"
          height="100%"
          visibleDragbar={false}
          highlightEnable={false}
          textareaProps={{
            placeholder: 'Write your content here...',
            spellCheck: true,
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'off',
          }}
        />
      </div>

      <style jsx global>{`
        .payload-markdown-editor {
          --md-editor-bg: var(--theme-elevation-0, #fff);
          --md-editor-bg-elevated: var(--theme-elevation-50, #f5f5f5);
          --md-editor-border: var(--theme-elevation-150, #e0e0e0);
          --md-editor-text: var(--theme-elevation-800, #333);
          --md-editor-text-muted: var(--theme-elevation-500, #666);
        }

        /* Conversion Toast */
        .payload-markdown-editor .conversion-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #34d399;
          color: #0f1a14;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Header */
        .payload-markdown-editor .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-150);
          border-bottom: none;
          border-radius: 4px 4px 0 0;
        }

        .payload-markdown-editor .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payload-markdown-editor .editor-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--theme-elevation-800);
        }

        .payload-markdown-editor .help-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: transparent;
          border: 1px solid var(--theme-elevation-150);
          border-radius: 4px;
          color: var(--theme-elevation-500);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .payload-markdown-editor .help-toggle:hover {
          background: var(--theme-elevation-100);
          color: var(--theme-elevation-800);
        }

        .payload-markdown-editor .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payload-markdown-editor .paste-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--theme-elevation-400);
        }

        .payload-markdown-editor .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--theme-elevation-100);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 4px;
          color: var(--theme-elevation-800);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .payload-markdown-editor .copy-btn:hover:not(:disabled) {
          background: var(--theme-elevation-150);
        }

        .payload-markdown-editor .copy-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Help Panel */
        .payload-markdown-editor .help-panel {
          padding: 12px 16px;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-150);
          border-top: none;
          border-bottom: none;
        }

        .payload-markdown-editor .help-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }

        @media (max-width: 900px) {
          .payload-markdown-editor .help-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 600px) {
          .payload-markdown-editor .help-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .payload-markdown-editor .help-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .payload-markdown-editor .help-item code {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 11px;
          padding: 3px 6px;
          background: var(--theme-elevation-100);
          border-radius: 3px;
          color: var(--theme-elevation-700);
        }

        .payload-markdown-editor .shortcuts {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: var(--theme-elevation-500);
        }

        .payload-markdown-editor .shortcuts kbd {
          display: inline-block;
          padding: 2px 5px;
          background: var(--theme-elevation-100);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 3px;
          font-family: inherit;
          font-size: 10px;
          box-shadow: 0 1px 0 var(--theme-elevation-200);
        }

        /* Editor Container */
        .payload-markdown-editor .editor-container {
          border: 1px solid var(--theme-elevation-150);
          border-radius: 0 0 4px 4px;
          overflow: visible;
          min-height: 500px;
          height: 60vh;
          max-height: 800px;
        }

        /* Ensure editor takes full height */
        .payload-markdown-editor .w-md-editor {
          height: 100% !important;
          min-height: 100% !important;
        }

        .payload-markdown-editor .w-md-editor-content {
          height: calc(100% - 40px) !important;
          min-height: calc(100% - 40px) !important;
        }

        .payload-markdown-editor .w-md-editor-area {
          height: 100% !important;
        }

        .payload-markdown-editor .w-md-editor-input,
        .payload-markdown-editor .w-md-editor-preview {
          height: 100% !important;
          min-height: 100% !important;
        }

        .payload-markdown-editor .w-md-editor-text-input,
        .payload-markdown-editor .w-md-editor-text {
          height: 100% !important;
          min-height: 100% !important;
        }

        /* ============= LIGHT MODE ============= */
        .payload-markdown-editor .editor-container.light .w-md-editor {
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          background: #ffffff !important;
          --color-canvas-default: #ffffff !important;
          --color-canvas-subtle: #f6f8fa !important;
          --color-border-default: #d0d7de !important;
          --color-border-muted: #d8dee4 !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-toolbar {
          background: #f6f8fa !important;
          border-bottom: 1px solid #d0d7de !important;
          padding: 8px !important;
          min-height: auto !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-toolbar button {
          color: #24292f !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-toolbar button:hover {
          background: #e0e0e0 !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-content {
          background: #ffffff !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-input {
          background: #ffffff !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text {
          color: #24292f !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre {
          color: #24292f !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text textarea {
          color: #24292f !important;
          caret-color: #24292f !important;
          -webkit-text-fill-color: #24292f !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text textarea::placeholder {
          color: #8b949e !important;
          -webkit-text-fill-color: #8b949e !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text textarea::selection {
          background: rgba(9, 105, 218, 0.2) !important;
          color: #24292f !important;
        }

        /* Override syntax highlighting colors in light mode */
        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .token,
        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code span {
          color: #24292f !important;
          text-decoration: none !important;
          background: transparent !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .title,
        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .bold {
          color: #1f2328 !important;
          font-weight: bold !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .italic {
          color: #24292f !important;
          font-style: italic !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .url,
        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .link {
          color: #0969da !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .code {
          color: #0550ae !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .quote {
          color: #57606a !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code .strike,
        .payload-markdown-editor
          .editor-container.light
          .w-md-editor-text-pre
          > code
          .strikethrough,
        .payload-markdown-editor .editor-container.light .w-md-editor-text-pre > code del {
          text-decoration: line-through !important;
          color: #57606a !important;
        }

        .payload-markdown-editor .editor-container.light .w-md-editor-preview {
          background: #f6f8fa !important;
        }

        /* ============= DARK MODE ============= */
        .payload-markdown-editor .editor-container.dark .w-md-editor {
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          background: #141414 !important;
          --color-canvas-default: #141414 !important;
          --color-canvas-subtle: #1c1c1c !important;
          --color-border-default: #3d3d3d !important;
          --color-border-muted: #2d2d2d !important;
          --color-fg-default: #e6e6e6 !important;
          --color-fg-muted: #8b949e !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-toolbar {
          background: #1c1c1c !important;
          border-bottom: 1px solid #3d3d3d !important;
          padding: 8px !important;
          min-height: auto !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-toolbar button {
          color: #e6e6e6 !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-toolbar button:hover {
          background: #3d3d3d !important;
        }

        .payload-markdown-editor
          .editor-container.dark
          .w-md-editor-toolbar
          button[data-active='true'] {
          background: #4d4d4d !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-toolbar-divider {
          background: #3d3d3d !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-content {
          background: #141414 !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-input {
          background: #141414 !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text {
          color: #e6e6e6 !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre {
          color: #e6e6e6 !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text textarea {
          color: #e6e6e6 !important;
          caret-color: #e6e6e6 !important;
          -webkit-text-fill-color: #e6e6e6 !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text textarea::placeholder {
          color: #6e6e6e !important;
          -webkit-text-fill-color: #6e6e6e !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text textarea::selection {
          background: rgba(88, 166, 255, 0.3) !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code {
          color: #e6e6e6 !important;
        }

        /* Override ALL syntax highlighting colors in dark mode */
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .token,
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code span {
          color: #e6e6e6 !important;
          text-decoration: none !important;
          background: transparent !important;
        }

        /* Specific markdown syntax highlighting for dark mode - make it subtle */
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .title,
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .bold {
          color: #ffffff !important;
          font-weight: bold !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .italic {
          color: #c9c9c9 !important;
          font-style: italic !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .url,
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .link {
          color: #58a6ff !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .code {
          color: #a5d6ff !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .quote {
          color: #8b949e !important;
        }

        /* Fix strikethrough display */
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .strike,
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code .strikethrough,
        .payload-markdown-editor .editor-container.dark .w-md-editor-text-pre > code del {
          text-decoration: line-through !important;
          color: #8b949e !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-preview {
          background: #1c1c1c !important;
          border-left: 1px solid #3d3d3d !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown {
          color: #e6e6e6 !important;
          background: transparent !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown h1,
        .payload-markdown-editor .editor-container.dark .wmde-markdown h2,
        .payload-markdown-editor .editor-container.dark .wmde-markdown h3,
        .payload-markdown-editor .editor-container.dark .wmde-markdown h4,
        .payload-markdown-editor .editor-container.dark .wmde-markdown h5,
        .payload-markdown-editor .editor-container.dark .wmde-markdown h6 {
          color: #ffffff !important;
          border-color: #3d3d3d !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown p,
        .payload-markdown-editor .editor-container.dark .wmde-markdown li {
          color: #c9c9c9 !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown a {
          color: #58a6ff !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown code {
          background: #2d2d2d !important;
          color: #ff7b72 !important;
          border-color: #3d3d3d !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown pre {
          background: #0d0d0d !important;
          border-color: #2d2d2d !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown pre code {
          color: #e6e6e6 !important;
          background: transparent !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown blockquote {
          background: #1f1f3d !important;
          border-left-color: #6366f1 !important;
          color: #c4b5fd !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown blockquote p {
          color: #c4b5fd !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown table th {
          background: #2d2d2d !important;
          color: #e6e6e6 !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown table td,
        .payload-markdown-editor .editor-container.dark .wmde-markdown table th {
          border-color: #3d3d3d !important;
        }

        .payload-markdown-editor .editor-container.dark .wmde-markdown hr {
          background: linear-gradient(to right, transparent, #3d3d3d, transparent) !important;
        }

        .payload-markdown-editor .editor-container.dark .w-md-editor-bar {
          background: #3d3d3d !important;
        }

        /* ============= SHARED STYLES ============= */
        .payload-markdown-editor .w-md-editor-toolbar ul {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 2px !important;
        }

        .payload-markdown-editor .w-md-editor-toolbar li {
          margin: 0 !important;
        }

        .payload-markdown-editor .w-md-editor-toolbar button {
          padding: 6px !important;
          border-radius: 4px !important;
          transition: all 0.1s !important;
          min-width: 28px !important;
          height: 28px !important;
        }

        .payload-markdown-editor .w-md-editor-toolbar-divider {
          height: 20px !important;
          margin: 4px 6px !important;
        }

        /* CRITICAL: Textarea and pre/code must have IDENTICAL font settings for caret alignment */
        .payload-markdown-editor .w-md-editor-text,
        .payload-markdown-editor .w-md-editor-text-pre,
        .payload-markdown-editor .w-md-editor-text-pre > code,
        .payload-markdown-editor .w-md-editor-text textarea {
          font-family:
            ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          letter-spacing: 0 !important;
          font-weight: 400 !important;
          tab-size: 2 !important;
          -moz-tab-size: 2 !important;
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
        }

        .payload-markdown-editor .w-md-editor-text {
          padding: 16px !important;
        }

        .payload-markdown-editor .w-md-editor-text textarea {
          padding: 16px !important;
          margin: 0 !important;
          border: none !important;
          outline: none !important;
          resize: none !important;
        }

        .payload-markdown-editor .w-md-editor-text-pre {
          padding: 16px !important;
          margin: 0 !important;
        }

        .payload-markdown-editor .w-md-editor-text-pre > code {
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Preview Container */
        .payload-markdown-editor .w-md-editor-preview {
          background: #ffffff !important;
          padding: 24px 28px !important;
          border-left: 1px solid var(--theme-elevation-150, #e0e0e0) !important;
          overflow-y: auto !important;
        }

        /* Preview Base Typography */
        .payload-markdown-editor .wmde-markdown {
          font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
            sans-serif !important;
          font-size: 15px !important;
          line-height: 1.75 !important;
          color: #1f2937 !important;
          letter-spacing: -0.01em !important;
        }

        /* Preview Headings */
        .payload-markdown-editor .wmde-markdown h1 {
          font-size: 2em !important;
          font-weight: 700 !important;
          margin: 0 0 0.75em !important;
          padding-bottom: 0.4em !important;
          border-bottom: 2px solid #e5e7eb !important;
          color: #111827 !important;
          line-height: 1.3 !important;
          letter-spacing: -0.02em !important;
        }

        .payload-markdown-editor .wmde-markdown h2 {
          font-size: 1.6em !important;
          font-weight: 700 !important;
          margin: 1.5em 0 0.6em !important;
          padding-bottom: 0.3em !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #111827 !important;
          line-height: 1.35 !important;
          letter-spacing: -0.02em !important;
        }

        .payload-markdown-editor .wmde-markdown h3 {
          font-size: 1.35em !important;
          font-weight: 600 !important;
          margin: 1.4em 0 0.5em !important;
          color: #1f2937 !important;
          line-height: 1.4 !important;
        }

        .payload-markdown-editor .wmde-markdown h4 {
          font-size: 1.15em !important;
          font-weight: 600 !important;
          margin: 1.3em 0 0.5em !important;
          color: #374151 !important;
          line-height: 1.4 !important;
        }

        .payload-markdown-editor .wmde-markdown h5 {
          font-size: 1.05em !important;
          font-weight: 600 !important;
          margin: 1.2em 0 0.4em !important;
          color: #4b5563 !important;
          line-height: 1.4 !important;
        }

        .payload-markdown-editor .wmde-markdown h6 {
          font-size: 1em !important;
          font-weight: 600 !important;
          margin: 1.1em 0 0.4em !important;
          color: #6b7280 !important;
          line-height: 1.4 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.03em !important;
        }

        /* Preview Paragraphs */
        .payload-markdown-editor .wmde-markdown p {
          margin-bottom: 1.25em !important;
          line-height: 1.75 !important;
          color: #374151 !important;
        }

        /* Preview Strong & Em */
        .payload-markdown-editor .wmde-markdown strong {
          font-weight: 600 !important;
          color: #111827 !important;
        }

        .payload-markdown-editor .wmde-markdown em {
          font-style: italic !important;
          color: #4b5563 !important;
        }

        /* Preview Blockquotes */
        .payload-markdown-editor .wmde-markdown blockquote {
          border-left: 4px solid #6366f1 !important;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%) !important;
          padding: 16px 20px !important;
          margin: 20px 0 !important;
          color: #4c1d95 !important;
          border-radius: 0 8px 8px 0 !important;
          font-style: italic !important;
        }

        .payload-markdown-editor .wmde-markdown blockquote p {
          margin: 0 !important;
          color: #5b21b6 !important;
          line-height: 1.7 !important;
        }

        .payload-markdown-editor .wmde-markdown blockquote p:not(:last-child) {
          margin-bottom: 0.75em !important;
        }

        /* Preview Inline Code */
        .payload-markdown-editor .wmde-markdown code {
          background: #f3f4f6 !important;
          padding: 3px 7px !important;
          border-radius: 4px !important;
          font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace !important;
          font-size: 0.875em !important;
          color: #dc2626 !important;
          border: 1px solid #e5e7eb !important;
          font-weight: 500 !important;
        }

        /* Preview Code Blocks */
        .payload-markdown-editor .wmde-markdown pre {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          padding: 20px 24px !important;
          border-radius: 8px !important;
          overflow-x: auto !important;
          margin: 24px 0 !important;
          border: 1px solid #334155 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }

        .payload-markdown-editor .wmde-markdown pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border: none !important;
          font-size: 0.9em !important;
          line-height: 1.6 !important;
          font-weight: 400 !important;
        }

        /* Preview Lists */
        .payload-markdown-editor .wmde-markdown ul,
        .payload-markdown-editor .wmde-markdown ol {
          padding-left: 28px !important;
          margin: 16px 0 !important;
        }

        .payload-markdown-editor .wmde-markdown li {
          margin: 8px 0 !important;
          line-height: 1.7 !important;
          color: #374151 !important;
        }

        .payload-markdown-editor .wmde-markdown li > p {
          margin-bottom: 0.5em !important;
        }

        .payload-markdown-editor .wmde-markdown ul {
          list-style-type: disc !important;
        }

        .payload-markdown-editor .wmde-markdown ul ul {
          list-style-type: circle !important;
          margin: 8px 0 !important;
        }

        .payload-markdown-editor .wmde-markdown ul ul ul {
          list-style-type: square !important;
        }

        .payload-markdown-editor .wmde-markdown ol {
          list-style-type: decimal !important;
        }

        /* Preview Tables */
        .payload-markdown-editor .wmde-markdown table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 24px 0 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
          border: 1px solid #e5e7eb !important;
        }

        .payload-markdown-editor .wmde-markdown table th,
        .payload-markdown-editor .wmde-markdown table td {
          border: 1px solid #e5e7eb !important;
          padding: 12px 16px !important;
          text-align: left !important;
          line-height: 1.5 !important;
        }

        .payload-markdown-editor .wmde-markdown table th {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6) !important;
          font-weight: 600 !important;
          color: #111827 !important;
          font-size: 0.9em !important;
          text-transform: uppercase !important;
          letter-spacing: 0.04em !important;
        }

        .payload-markdown-editor .wmde-markdown table tr:nth-child(even) {
          background: #f9fafb !important;
        }

        .payload-markdown-editor .wmde-markdown table tr:hover {
          background: #f3f4f6 !important;
        }

        /* Preview Links */
        .payload-markdown-editor .wmde-markdown a {
          color: #2563eb !important;
          text-decoration: none !important;
          border-bottom: 1px solid #93c5fd !important;
          transition: all 0.15s ease !important;
          font-weight: 500 !important;
        }

        .payload-markdown-editor .wmde-markdown a:hover {
          color: #1d4ed8 !important;
          border-bottom-color: #2563eb !important;
          background: #eff6ff !important;
        }

        /* Preview Images */
        .payload-markdown-editor .wmde-markdown img {
          max-width: 100% !important;
          border-radius: 8px !important;
          margin: 20px 0 !important;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }

        /* Preview HR */
        .payload-markdown-editor .wmde-markdown hr {
          border: none !important;
          height: 2px !important;
          background: linear-gradient(to right, transparent, #d1d5db, transparent) !important;
          margin: 32px 0 !important;
        }

        /* Preview Task Lists */
        .payload-markdown-editor .wmde-markdown input[type='checkbox'] {
          margin-right: 8px !important;
          transform: scale(1.1) !important;
          cursor: pointer !important;
        }

        /* Preview Strikethrough */
        .payload-markdown-editor .wmde-markdown del {
          text-decoration: line-through !important;
          color: #9ca3af !important;
        }

        /* Dragbar */
        .payload-markdown-editor .w-md-editor-bar {
          cursor: row-resize !important;
          background: var(--theme-elevation-150, #e0e0e0) !important;
          height: 4px !important;
        }

        .payload-markdown-editor .w-md-editor-bar:hover {
          background: var(--theme-elevation-300, #ccc) !important;
        }
      `}</style>
    </div>
  )
}
