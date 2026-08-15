import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-[0.95rem] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h3 className="mt-4 text-lg font-bold" {...p} />,
          h2: (p) => <h3 className="mt-4 text-base font-bold" {...p} />,
          h3: (p) => <h4 className="mt-3 font-semibold" {...p} />,
          p: (p) => <p className="leading-relaxed" {...p} />,
          ul: (p) => <ul className="ml-5 list-disc space-y-1" {...p} />,
          ol: (p) => <ol className="ml-5 list-decimal space-y-1" {...p} />,
          a: (p) => <a className="text-primary underline underline-offset-2" {...p} />,
          code: ({ className, children, ...rest }) =>
            className?.includes("language-") ? (
              <code
                className="block overflow-x-auto rounded-xl bg-secondary p-3 text-xs"
                {...rest}
              >
                {children}
              </code>
            ) : (
              <code className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.85em]" {...rest}>
                {children}
              </code>
            ),
          table: (p) => (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" {...p} />
            </div>
          ),
          th: (p) => <th className="border-b border-border px-2 py-1 font-semibold" {...p} />,
          td: (p) => <td className="border-b border-border px-2 py-1" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}