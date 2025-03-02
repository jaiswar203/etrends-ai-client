"use client"

import React from 'react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { cn } from '@/lib/utils'

interface MarkdownDisplayProps {
  content: string
  className?: string
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content, className }) => {
  // Pre-process content to ensure proper list formatting
  const processedContent = content
    // Fix numbered lists that don't have a space after the period
    .replace(/^(\d+)\.\s*(.+)$/gm, '$1. $2')
    // Ensure there's a blank line before lists for proper parsing
    .replace(/([^\n])\n([\d]+\.|\*|\-)/g, '$1\n\n$2');

  return (
    <div className={cn("markdown-content prose prose-sm max-w-none dark:prose-invert", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ ...props }) => <h1 className="text-xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ ...props }) => <h2 className="text-lg font-bold mt-5 mb-3" {...props} />,
          h3: ({ ...props }) => <h3 className="text-md font-bold mt-4 mb-2" {...props} />,
          h4: ({ ...props }) => <h4 className="text-base font-semibold mt-3 mb-2" {...props} />,
          p: ({ ...props }) => <p className="my-2" {...props} />,
          a: ({ ...props }) => (
            <a 
              className="text-blue-600 hover:text-blue-800 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          ul: ({ ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
          li: ({ ...props }) => <li className="my-1" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3" {...props} />
          ),
          hr: ({ ...props }) => <hr className="my-4 border-gray-300" {...props} />,
          img: ({ ...props }) => (
            <img className="max-w-full h-auto my-4 rounded" {...props} alt={props.alt || 'Image'} />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-gray-100" {...props} />,
          tbody: ({ ...props }) => <tbody {...props} />,
          tr: ({ ...props }) => <tr className="border-b border-gray-300" {...props} />,
          th: ({ ...props }) => (
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            
            return isInline ? (
              <code className="bg-gray-400 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                // @ts-expect-error - The type definitions are incorrect, but this works
                style={vscDarkPlus}
                language={match ? match[1] : ''}
                PreTag="div"
                className="rounded-md my-4"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          pre: ({ ...props }) => {
            return <pre className="overflow-auto rounded-md my-4" {...props} />
          },
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  )
}

export default MarkdownDisplay 