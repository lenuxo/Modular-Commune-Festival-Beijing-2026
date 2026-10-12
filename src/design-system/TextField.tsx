import type {ComponentProps} from 'react'

/** Composite input: the outer field owns its focus ring, including icons and padding. */
export function TextField({className = '', ...props}: ComponentProps<'label'>) {
  return <label {...props} className={`ui-text-field material-inset ${className}`}/>
}
