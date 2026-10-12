import type {ReactNode} from 'react'
import {Button} from './Button'

type Option = {value: string; label: ReactNode}

/** One recessed track, with a raised selected key. Uses native toggle buttons. */
export function SegmentedControl({label, value, options, onChange}: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void
}) {
  return <div className="segmented ui-segmented material-inset" role="group" aria-label={label}>
    {options.map(option => <Button key={option.value} material="ghost"
      className={value === option.value ? 'active' : ''} aria-pressed={value === option.value}
      onClick={() => onChange(option.value)}>{option.label}</Button>)}
  </div>
}
