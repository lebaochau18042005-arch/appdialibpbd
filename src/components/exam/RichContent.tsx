import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface RichContentProps {
  content: string;
  className?: string;
}

/**
 * Unified rich content renderer supporting:
 * - GFM tables (markdown pipe tables)
 * - LaTeX math via KaTeX ($inline$, $$block$$)
 * - Bold, italic, code, headers
 * - Image rendering (for charts embedded as URLs)
 */
export default function RichContent({ content, className = '' }: RichContentProps) {
  return (
    <div className={`rich-content ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Styled table with header
          table: ({ node, ...props }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
              <table className="text-sm text-slate-700 w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-indigo-600 text-white" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="even:bg-white odd:bg-indigo-50/40 hover:bg-indigo-50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2.5 border border-indigo-500 text-center whitespace-nowrap font-bold text-sm" {...props} />
          ),
          td: ({ node, children, ...props }) => (
            <td className="px-4 py-2 border border-indigo-100 text-center text-slate-600 whitespace-nowrap" {...props}>
              {children}
            </td>
          ),
          // Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900" {...props} />
          ),
          // Code inline
          code: ({ node, className: codeClass, children, ...props }) => {
            const isBlock = codeClass?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-slate-100 rounded-lg p-3 overflow-x-auto my-3 text-sm font-mono text-slate-800">
                  <code {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800" {...props}>
                {children}
              </code>
            );
          },
          // Render images (charts) if a URL is embedded
          img: ({ node, src, alt, ...props }) => (
            <div className="my-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
              <img src={src} alt={alt || 'Hình minh họa'} className="max-w-full max-h-80 object-contain" {...props} />
            </div>
          ),
          // Paragraph
          p: ({ node, ...props }) => (
            <p className="mb-2 leading-relaxed" {...props} />
          ),
          // Headings
          h2: ({ node, ...props }) => (
            <h2 className="font-black text-slate-800 text-lg mt-3 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="font-bold text-slate-700 text-base mt-2 mb-1" {...props} />
          ),
          // Blockquote for data annotations
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-slate-500 my-3" {...props} />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
