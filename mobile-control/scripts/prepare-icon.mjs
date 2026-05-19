import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const src = path.join(root, '..', 'public', 'turnoatiempo.jpg')
const assetsDir = path.join(root, 'assets')

await mkdir(assetsDir, { recursive: true })

/** Logo centrado 1024×1024 para icono de launcher Android */
const icon = await sharp(src)
  .resize(1024, 1024, { fit: 'cover', position: 'centre' })
  .png()
  .toBuffer()

await sharp(icon).toFile(path.join(assetsDir, 'icon-only.png'))
await sharp(icon).toFile(path.join(assetsDir, 'icon.png'))

console.log('Iconos fuente generados en assets/')
