const esc = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
export default function scope(css, parent, o) {
  if (!css || !parent) return css

  o = typeof o === 'string' ? { keyframes: o } : (o || {})

  css = replace(css, parent + ' $1$2')

  const pre = esc(parent)

  css = css
    .replace(new RegExp(pre + '\\s+' + pre + '(?=[\\s\\r\\n,{])', 'g'), parent)
    .replace(new RegExp(pre + '\\s*:host', 'g'), parent)
    .replace(new RegExp(pre + '\\s*@', 'g'), '@')
    .replace(new RegExp(pre + '\\s*:root', 'g'), ':root')

  if (o.keyframes) {
    const anims = new Set()
    css.replace(/@keyframes\s+([a-zA-Z0-9_-]+)\s*{/g, (_, n) => anims.add(n))

    const slug = parent.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
    const pfx = o.keyframes === true ? slug + '-' : String(o.keyframes)

    for (const name of anims) {
      const nn = pfx + name
      css = css
        .replace(new RegExp('(@keyframes\\s+)' + name + '(\\s*{)', 'g'), '$1' + nn + '$2')
        .replace(new RegExp('(animation(?:-name)?\\s*:[^;]*\\s*)' + name + '([\\s;}])', 'g'), '$1' + nn + '$2')
    }
  }

  css = css.replace(
    new RegExp('(' + pre + ' )(\\s*(?:to|from|[+-]?(?:(?:\\.\\d+)|(?:\\d+(?:\\.\\d*)?))%))(?=[\\s\\r\\n,{])', 'g'),
    '$2'
  )

  return css
}

export function replace(css, replacer) {
  const strs = []

  css = css.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, m => '\x00' + strs.push(m) + '\x00')

  css = css.replace(/\/\*[\s\S]*?\*\//g, '')

  css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (_, sel, end) => {
    const trimmed = sel.trim()
    const idx = sel.indexOf(trimmed[0])
    const lead = idx > 0 ? sel.slice(0, idx) : ''
    const trail = sel.slice(sel.lastIndexOf(trimmed.slice(-1)) + 1)
    return lead + replacer.replace('$1', trimmed).replace('$2', trail + end)
  })

  return css.replace(/\x00(\d+)\x00/g, (_, i) => strs[i - 1])
}

scope.replace = replace
