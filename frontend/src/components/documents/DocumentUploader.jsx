import { FileUp, X } from 'lucide-react'
import { useRef, useState } from 'react'

const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'pptx']

export default function DocumentUploader({ file, currentFileName, error, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const acceptFile = (candidate) => {
    if (!candidate) return
    const extension = candidate.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(extension)) return onChange(null, 'Choose a PDF, image, MP4, or PPTX file.')
    if (candidate.size > 20 * 1024 * 1024) return onChange(null, 'The file must not exceed 20 MB.')
    onChange(candidate, null)
  }

  return (
    <div>
      <div className={`rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-slate-300 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950'}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]) }}>
        <FileUp className="mx-auto text-blue-600" size={28} />
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-zinc-100">Drop a document here</p>
        <p className="mt-1 text-xs text-slate-500">PDF, images, MP4, or PPTX · maximum 20 MB</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="button button-secondary button-sm mt-4">Choose file</button>
        <input ref={inputRef} type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.pptx" onChange={(event) => acceptFile(event.target.files[0])} />
      </div>
      {(file || currentFileName) && <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-zinc-800"><span className="min-w-0 truncate text-slate-700 dark:text-zinc-300">{file?.name || currentFileName}</span>{file && <button type="button" onClick={() => onChange(null, null)} className="icon-button !h-8 !w-8" aria-label="Remove selected file"><X size={15} /></button>}</div>}
      {error && <p className="mt-2 text-sm font-semibold text-red-600" role="alert">{error}</p>}
    </div>
  )
}
