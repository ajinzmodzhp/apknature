/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: false // required for formidable file parsing
  }
}
module.exports = nextConfig