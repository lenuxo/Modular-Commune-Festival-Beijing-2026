import {readFileSync, writeFileSync} from 'node:fs'
const spec = JSON.parse(readFileSync(new URL('../design/soft-touch-console/tokens.json', import.meta.url)))
const kebab = value => value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
const vars = Object.entries(spec.colors).map(([key, value]) => `  --color-${kebab(key)}: ${value};`)
for (const [key, value] of Object.entries(spec.radius)) vars.push(`  --radius-${key}: ${value}px;`)
for (const value of spec.spacing) vars.push(`  --space-${value}: ${value}px;`)
for (const key of ['raised', 'inset', 'primary', 'pressed']) vars.push(`  --shadow-${key}: ${spec.material[key]};`)
for (const [key, values] of Object.entries(spec.type)) {
  if (typeof values !== 'object') continue
  for (const [property, value] of Object.entries(values)) vars.push(`  --type-${kebab(key)}-${kebab(property)}: ${value}${property === 'size' ? 'px' : ''};`)
}
for (const [key, value] of Object.entries(spec.dimensions)) vars.push(`  --size-${kebab(key)}: ${value}${typeof value === 'number' ? 'px' : ''};`)
writeFileSync(new URL('../src/design-system/tokens.css', import.meta.url), `/* Generated from design/soft-touch-console/tokens.json. Run npm run design:tokens. */\n:root {\n${vars.join('\n')}\n}\n`)
