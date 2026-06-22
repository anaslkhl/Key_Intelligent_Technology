export const KB_CATEGORIES = [
  { value: 'getting_started', label: 'Getting Started' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'product_guides', label: 'Product Guides' },
  { value: 'faqs', label: 'FAQs' },
  { value: 'video_tutorials', label: 'Video Tutorials' },
]

export const categoryLabel = (value) => KB_CATEGORIES.find((category) => category.value === value)?.label || 'Getting Started'

export const categoryStyles = {
  getting_started: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  troubleshooting: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  maintenance: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  product_guides: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  faqs: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  video_tutorials: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
}

export function parseMarkdownHeadings(content = '') {
  const counts = new Map()

  return content.split('\n').flatMap((line) => {
    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line.trim())
    if (!match) return []
    const text = match[2].replace(/\[([^\]]+)\]\([^)]+\)|[*_`~]/g, '$1').trim()
    return [{ level: match[1].length, text, id: uniqueHeadingId(text, counts) }]
  })
}

export function uniqueHeadingId(text, counts) {
  const base = text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') || 'section'
  const count = counts.get(base) || 0
  counts.set(base, count + 1)
  return count === 0 ? base : `${base}-${count + 1}`
}

export function remarkHeadingIds() {
  return (tree) => {
    const counts = new Map()

    visitHeadings(tree, (node) => {
      const id = uniqueHeadingId(astText(node), counts)
      node.data = { ...(node.data || {}), hProperties: { ...(node.data?.hProperties || {}), id } }
    })
  }
}

function visitHeadings(node, callback) {
  if (node.type === 'heading' && node.depth <= 3) callback(node)
  node.children?.forEach((child) => visitHeadings(child, callback))
}

function astText(node) {
  if (typeof node.value === 'string') return node.value
  return node.children?.map(astText).join('') || ''
}
