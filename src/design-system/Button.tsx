import type {ComponentProps} from 'react'

/** Shared physical control. Layout and accessible names belong to the caller. */
type ButtonProps = ComponentProps<'button'> & {material?: 'raised' | 'ghost'}

export function Button({className = '', type = 'button', material, ...props}: ButtonProps) {
  const raised = /(?:primary-btn|secondary-btn|filter-select-trigger|schedule-mine)/.test(className)
  return <button {...props} type={type} className={`ui-button ${className}`} data-material={material ?? (raised ? 'raised' : 'ghost')}/>
}
