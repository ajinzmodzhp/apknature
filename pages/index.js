import { useState } from 'react'

export default function Home() {
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState('')

  function handleFiles(e) {
    const list = Array.from(e.target.files)
    setFiles(list)
    setLog(`${list.length} file(s) selected`)
  }

  async function sendAll() {
    if (files.length === 0) return alert('Please choose files or a folder first.')
    if (!confirm(`Send ${files.length} file(s) to your Telegram bot?`)) return

    setSending(true)
    setLog('Uploading...')
    setProgress(0)

    const form = new FormData()
    files.forEach((f, i) => form.append('files', f))

    try {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload', true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setProgress(percent)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          setLog('All files sent. Telegram responses: ' + xhr.responseText)
        } else {
          setLog('Upload error: ' + xhr.statusText)
        }
        setSending(false)
      }

      xhr.onerror = () => {
        setLog('Network error occurred.')
        setSending(false)
      }

      xhr.send(form)
    } catch (err) {
      setLog('Network error: ' + String(err))
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen p-6 bg-slate-50 text-slate-800">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Telegram SDCard Sender</h1>
        <p className="mb-4">Open this page on your Android device. Tap <em>Choose folder</em> and select the folder you want to send (the browser will list files). Then tap <strong>Send All to Telegram</strong>.</p>

        <label className="block mb-4">
          <div className="mb-2">Choose folder (or files)</div>
          <input
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={handleFiles}
            className="w-full"
          />
        </label>

        <div className="mb-4">
          <strong>Selected files:</strong>
          <div className="mt-2 max-h-48 overflow-auto border rounded p-2 bg-slate-50">
            {files.length === 0 ? <div className="text-sm text-slate-500">No files selected</div> : (
              <ul className="text-sm space-y-1">
                {files.slice(0, 200).map((f, i) => (
                  <li key={i} className="truncate">{f.webkitRelativePath || f.name} — {f.size} bytes</li>
                ))}
              </ul>
            )}
          </div>
          {files.length > 200 && <div className="text-xs text-amber-600 mt-1">Showing first 200 files</div>}
        </div>

        {sending && (
          <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
            <div className="bg-sky-600 h-4 rounded-full" style={{width: `${progress}%`}}></div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={sendAll}
            disabled={sending}
            className="px-4 py-2 rounded-xl shadow bg-sky-600 text-white disabled:opacity-60"
          >
            {sending ? `Sending… ${progress}%` : 'Send All to Telegram'}
          </button>

          <button onClick={() => { setFiles([]); setLog(''); setProgress(0) }} className="px-4 py-2 rounded-xl border">Clear</button>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          <div><strong>Status:</strong></div>
          <pre className="whitespace-pre-wrap p-2 bg-slate-100 rounded mt-2">{log}</pre>
        </div>

        <div className="mt-4 text-xs text-amber-700">Important: your browser must allow selecting directories. This page will not automatically read your SDCard without your explicit selection.</div>
      </div>
    </main>
  )
}
