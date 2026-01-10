'use client'

import { sanitizeHtml } from '@/lib/sanitize'

/**
 * Rich text node interface for Slate content
 */
interface RichTextNode {
  type?: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  url?: string
  newTab?: boolean
  children?: RichTextNode[]
  textAlign?: 'left' | 'center' | 'right'
}

export interface SlateRichTextProps {
  content: Record<string, unknown> | RichTextNode[] | null | undefined
  className?: string
}

/**
 * Render a single rich text node to HTML
 */
function renderNode(node: RichTextNode): string {
  if (!node) return ''

  // Text node with possible formatting
  if (node.text !== undefined) {
    let text = node.text
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.strikethrough) text = `<s>${text}</s>`
    if (node.code) text = `<code>${text}</code>`
    return text
  }

  // Render children
  const children = node.children?.map(renderNode).join('') || ''

  // Text alignment style
  const alignStyle = node.textAlign ? ` style="text-align: ${node.textAlign}"` : ''

  // Element types
  switch (node.type) {
    case 'h1':
      return `<h1${alignStyle}>${children}</h1>`
    case 'h2':
      return `<h2${alignStyle}>${children}</h2>`
    case 'h3':
      return `<h3${alignStyle}>${children}</h3>`
    case 'h4':
      return `<h4${alignStyle}>${children}</h4>`
    case 'h5':
      return `<h5${alignStyle}>${children}</h5>`
    case 'h6':
      return `<h6${alignStyle}>${children}</h6>`
    case 'quote':
    case 'blockquote':
      return `<blockquote${alignStyle}>${children}</blockquote>`
    case 'ul':
      return `<ul>${children}</ul>`
    case 'ol':
      return `<ol>${children}</ol>`
    case 'li':
      return `<li>${children}</li>`
    case 'link':
      return `<a href="${node.url || '#'}" ${node.newTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${children}</a>`
    case 'indent':
      return `<div class="pl-8">${children}</div>`
    default:
      // Default to paragraph for unknown types or root nodes
      if (children) {
        return `<p${alignStyle}>${children}</p>`
      }
      return ''
  }
}

/**
 * Slate Rich Text Renderer Component
 * Renders Slate editor content with proper formatting
 */
export function SlateRichText({ content, className = '' }: SlateRichTextProps) {
  if (!content) return null

  // Handle array of nodes (standard Slate format)
  if (Array.isArray(content)) {
    if (content.length === 0) return null

    const html = content.map(renderNode).join('')

    return (
      <div
        className={`slate-rich-text prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
    )
  }

  // Handle object format (might be wrapped content)
  if (typeof content === 'object') {
    // Check if it has a root or children property
    const nodes =
      (content as { root?: RichTextNode[]; children?: RichTextNode[] }).root ||
      (content as { children?: RichTextNode[] }).children ||
      []

    if (Array.isArray(nodes) && nodes.length > 0) {
      const html = nodes.map(renderNode).join('')
      return (
        <div
          className={`slate-rich-text prose prose-sm max-w-none ${className}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      )
    }
  }

  return null
}
