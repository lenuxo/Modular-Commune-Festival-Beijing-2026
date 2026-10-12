import type {ReactNode} from 'react'

/** Shared framed list surface; content, identity and actions are separate slots. */
export function ListRow({children, className = '', saved = false, inspected = false, visited = false}: {
  children: ReactNode; className?: string; saved?: boolean; inspected?: boolean; visited?: boolean
}) {
  return <article className={`list-row ${className} ${saved ? 'is-saved' : ''} ${inspected ? 'is-inspected' : ''}`}
    data-saved={saved || undefined} data-visited={visited || undefined}>{children}</article>
}
