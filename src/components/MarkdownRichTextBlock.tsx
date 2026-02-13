import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Quote } from 'lucide-react'

interface MarkdownRichTextBlockProps {
  markdown: string
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
}

const accentColors = {
  amber: {
    badge: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-600',
    blockquote: 'from-amber-50 to-yellow-50 border-amber-100',
    icon: 'text-amber-600',
  },
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700',
    dot: 'bg-indigo-600',
    blockquote: 'from-indigo-50 to-purple-50 border-indigo-100',
    icon: 'text-indigo-600',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700',
    dot: 'bg-purple-600',
    blockquote: 'from-purple-50 to-pink-50 border-purple-100',
    icon: 'text-purple-600',
  },
  green: {
    badge: 'bg-green-50 text-green-700',
    dot: 'bg-green-600',
    blockquote: 'from-green-50 to-emerald-50 border-green-100',
    icon: 'text-green-600',
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-600',
    blockquote: 'from-blue-50 to-cyan-50 border-blue-100',
    icon: 'text-blue-600',
  },
}

export function MarkdownRichTextBlock({
  markdown,
  accentColor = 'amber',
}: MarkdownRichTextBlockProps) {
  const colors = accentColors[accentColor]

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-lg prose-headings:scroll-mt-20 max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Paragraphs
                p: ({ children, ...props }) => (
                  <p className="mb-6 text-lg leading-relaxed text-foreground/80" {...props}>
                    {children}
                  </p>
                ),
                // Headings
                h1: ({ children, ...props }) => (
                  <h1 className="mb-6 mt-12 text-4xl" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="mb-6 mt-12 text-3xl" {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="mb-6 mt-10 text-2xl" {...props}>
                    {children}
                  </h3>
                ),
                h4: ({ children, ...props }) => (
                  <h4 className="mb-4 mt-8 text-xl" {...props}>
                    {children}
                  </h4>
                ),
                h5: ({ children, ...props }) => (
                  <h5 className="mb-3 mt-6 text-lg" {...props}>
                    {children}
                  </h5>
                ),
                h6: ({ children, ...props }) => (
                  <h6 className="mb-3 mt-6 text-base" {...props}>
                    {children}
                  </h6>
                ),
                // Blockquote
                blockquote: ({ children }) => (
                  <div
                    className={`my-12 bg-gradient-to-br p-8 ${colors.blockquote} rounded-2xl border`}
                  >
                    <Quote className={`h-8 w-8 ${colors.icon} mb-4`} />
                    <blockquote className="mb-0 text-xl italic text-foreground">
                      {children}
                    </blockquote>
                  </div>
                ),
                // Lists
                ul: ({ children, ...props }) => (
                  <ul
                    className="mb-6 ml-4 list-inside list-disc space-y-2 text-foreground/80"
                    {...props}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol
                    className="mb-6 ml-4 list-inside list-decimal space-y-2 text-foreground/80"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className="text-lg leading-relaxed" {...props}>
                    {children}
                  </li>
                ),
                // Code
                code: ({ children, className, ...props }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="rounded bg-muted px-2 py-1 text-sm text-indigo-700" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code
                      className="mb-6 block overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                pre: ({ children, ...props }) => (
                  <pre
                    className="mb-6 overflow-x-auto rounded-lg bg-slate-900 p-4 text-slate-100"
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                // Links
                a: ({ children, ...props }) => (
                  <a className="text-indigo-600 underline hover:text-indigo-700" {...props}>
                    {children}
                  </a>
                ),
                // Strong and Em
                strong: ({ children, ...props }) => (
                  <strong className="font-semibold text-foreground" {...props}>
                    {children}
                  </strong>
                ),
                em: ({ children, ...props }) => (
                  <em className="italic" {...props}>
                    {children}
                  </em>
                ),
                // Horizontal Rule
                hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
                // Tables
                table: ({ children, ...props }) => (
                  <div className="my-8 overflow-x-auto">
                    <table
                      className="min-w-full divide-y divide-border rounded-lg border border-border"
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children, ...props }) => (
                  <thead className="bg-muted" {...props}>
                    {children}
                  </thead>
                ),
                tbody: ({ children, ...props }) => (
                  <tbody className="divide-y divide-gray-200 bg-white" {...props}>
                    {children}
                  </tbody>
                ),
                tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
                th: ({ children, ...props }) => (
                  <th
                    className="px-6 py-3 text-left text-xs uppercase tracking-wider text-foreground/80"
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="px-6 py-4 text-sm text-foreground/80" {...props}>
                    {children}
                  </td>
                ),
                // Images
                img: ({ src, alt }) => (
                  <Image
                    src={typeof src === 'string' ? src : ''}
                    alt={alt || ''}
                    width={800}
                    height={600}
                    className="my-8 w-full rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 800px"
                  />
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  )
}
