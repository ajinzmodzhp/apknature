import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false
  }
}

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT) return res.status(500).json({ error: 'Bot token or chat id not configured' })

  const form = new formidable.IncomingForm({ multiples: true })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: String(err) })

    let fileList = []
    if (files.files && Array.isArray(files.files)) fileList = files.files
    else if (files.files) fileList = [files.files]

    for (const k of Object.keys(files)) {
      const f = files[k]
      if (Array.isArray(f)) fileList.push(...f)
      else if (f && !fileList.includes(f)) fileList.push(f)
    }

    if (fileList.length === 0) return res.status(400).json({ error: 'No files uploaded' })

    const results = []
    for (const f of fileList) {
      try {
        const stream = fs.createReadStream(f.filepath || f.path || f.file)
        const formData = new FormData()
        formData.append('chat_id', TELEGRAM_CHAT)
        formData.append('document', stream, f.originalFilename || f.name || 'file')

        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, {
          method: 'POST',
          body: formData
        })
        const json = await tgRes.json()
        results.push({ ok: json.ok, result: json.result })

        try { fs.unlinkSync(f.filepath || f.path) } catch (e) { }
      } catch (e) {
        results.push({ ok: false, error: String(e) })
      }
    }

    res.status(200).json(results)
  })
}
