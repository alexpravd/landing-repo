import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Quote } from 'lucide-react';

interface MarkdownRichTextBlockProps {
  markdown: string;
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue';
}

const accentColors = {
  amber: {
    badge: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-600',
    blockquote: 'from-amber-50 to-yellow-50 border-amber-100',
    icon: 'text-amber-600'
  },
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700',
    dot: 'bg-indigo-600',
    blockquote: 'from-indigo-50 to-purple-50 border-indigo-100',
    icon: 'text-indigo-600'
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700',
    dot: 'bg-purple-600',
    blockquote: 'from-purple-50 to-pink-50 border-purple-100',
    icon: 'text-purple-600'
  },
  green: {
    badge: 'bg-green-50 text-green-700',
    dot: 'bg-green-600',
    blockquote: 'from-green-50 to-emerald-50 border-green-100',
    icon: 'text-green-600'
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-600',
    blockquote: 'from-blue-50 to-cyan-50 border-blue-100',
    icon: 'text-blue-600'
  }
};

export function MarkdownRichTextBlock({
  markdown,
  accentColor = 'amber'
}: MarkdownRichTextBlockProps) {
  const colors = accentColors[accentColor];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">

          <div className="prose prose-lg max-w-none prose-headings:scroll-mt-20">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Paragraphs
                p: ({ children, ...props }) => (
                  <p className="text-lg text-gray-700 leading-relaxed mb-6" {...props}>
                    {children}
                  </p>
                ),
                // Headings
                h1: ({ children, ...props }) => (
                  <h1 className="text-4xl mt-12 mb-6" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-3xl mt-12 mb-6" {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="text-2xl mt-10 mb-6" {...props}>
                    {children}
                  </h3>
                ),
                h4: ({ children, ...props }) => (
                  <h4 className="text-xl mt-8 mb-4" {...props}>
                    {children}
                  </h4>
                ),
                h5: ({ children, ...props }) => (
                  <h5 className="text-lg mt-6 mb-3" {...props}>
                    {children}
                  </h5>
                ),
                h6: ({ children, ...props }) => (
                  <h6 className="text-base mt-6 mb-3" {...props}>
                    {children}
                  </h6>
                ),
                // Blockquote
                blockquote: ({ children }) => (
                  <div className={`my-12 p-8 bg-gradient-to-br ${colors.blockquote} rounded-2xl border`}>
                    <Quote className={`h-8 w-8 ${colors.icon} mb-4`} />
                    <blockquote className="text-xl text-gray-800 italic mb-0">
                      {children}
                    </blockquote>
                  </div>
                ),
                // Lists
                ul: ({ children, ...props }) => (
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6 ml-4" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className="text-lg leading-relaxed" {...props}>
                    {children}
                  </li>
                ),
                // Code
                code: ({ inline, children, ...props }: any) =>
                  inline ? (
                    <code className="bg-gray-100 text-indigo-700 px-2 py-1 rounded text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-6" {...props}>
                      {children}
                    </code>
                  ),
                pre: ({ children, ...props }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6" {...props}>
                    {children}
                  </pre>
                ),
                // Links
                a: ({ children, ...props }) => (
                  <a className="text-indigo-600 hover:text-indigo-700 underline" {...props}>
                    {children}
                  </a>
                ),
                // Strong and Em
                strong: ({ children, ...props }) => (
                  <strong className="font-semibold text-gray-900" {...props}>
                    {children}
                  </strong>
                ),
                em: ({ children, ...props }) => (
                  <em className="italic" {...props}>
                    {children}
                  </em>
                ),
                // Horizontal Rule
                hr: ({ ...props }) => (
                  <hr className="my-8 border-gray-200" {...props} />
                ),
                // Tables
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-8">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children, ...props }) => (
                  <thead className="bg-gray-50" {...props}>
                    {children}
                  </thead>
                ),
                tbody: ({ children, ...props }) => (
                  <tbody className="bg-white divide-y divide-gray-200" {...props}>
                    {children}
                  </tbody>
                ),
                tr: ({ children, ...props }) => (
                  <tr {...props}>
                    {children}
                  </tr>
                ),
                th: ({ children, ...props }) => (
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="px-6 py-4 text-sm text-gray-700" {...props}>
                    {children}
                  </td>
                ),
                // Images
                img: ({ ...props }) => (
                  <img className="rounded-lg my-8 w-full" {...props} alt={props.alt || ''} />
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
