function drawStarOnCanvas(ctx, cx, cy, outerR, innerR) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a)
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = '#FFD700'
  ctx.fill()
}

function drawStickers(ctx, stickers, w, h) {
  const outerR = Math.round(Math.min(w, h) * 0.037)
  const innerR = Math.round(outerR * 0.42)
  for (const { type, x, y } of stickers) {
    if (type === 'star') drawStarOnCanvas(ctx, x * w, y * h, outerR, innerR)
  }
}

function getCanvasSlots(layout, w, h) {
  switch (layout) {
    case 'polaroid':
      return [{ x: 28, y: 28, w: w - 56, h: h - 118 }]
    case 'vertical-strip': {
      const pad = 20, ph = 334, gap = 8
      return [0,1,2].map(i => ({ x: pad, y: pad + i*(ph+gap), w: w - pad*2, h: ph }))
    }
    case 'landscape-sequence': {
      const pad = 20, pw = 400, gap = 8
      return [0,1,2].map(i => ({ x: pad + i*(pw+gap), y: pad, w: pw, h: h - pad*2 }))
    }
    case 'modern-grid': {
      const pad = 20, pw = 400, ph = 300, gap = 8
      return [0,1,2,3].map(i => ({ x: pad + (i%2)*(pw+gap), y: pad + Math.floor(i/2)*(ph+gap), w: pw, h: ph }))
    }
    case 'mixed-narrative': {
      const pad = 16, gap = 8, innerW = 588
      const topH = Math.round(innerW * 9/16)
      const bottomW = Math.round((innerW - gap*2) / 3)
      const bottomH = Math.round(bottomW * 3/4)
      const bottomY = pad + topH + gap
      return [
        { x: pad, y: pad, w: innerW, h: topH },
        ...[0,1,2].map(i => ({ x: pad + i*(bottomW+gap), y: bottomY, w: bottomW, h: bottomH }))
      ]
    }
    default: return []
  }
}

function drawFrameOverlay(ctx, w, h, fc, fsId, slots) {
  ctx.beginPath()
  if (fsId === 'rounded') {
    const r = Math.min(w, h) * 0.05
    ctx.roundRect(0, 0, w, h, r)
  } else {
    ctx.rect(0, 0, w, h)
  }
  slots.forEach(s => ctx.rect(s.x, s.y, s.w, s.h))
  ctx.fillStyle = fc
  ctx.fill('evenodd')
}

function traceFramePath(ctx, w, h, styleId) {
  ctx.beginPath()
  if (styleId === 'rounded') {
    const r = Math.min(w, h) * 0.05
    ctx.roundRect(0, 0, w, h, r)
  } else {
    ctx.rect(0, 0, w, h)
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height
  const slotRatio = w / h
  let sx, sy, sw, sh
  if (imgRatio > slotRatio) {
    sh = img.height; sw = sh * slotRatio
    sx = (img.width - sw) / 2; sy = 0
  } else {
    sw = img.width; sh = sw / slotRatio
    sx = 0; sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export async function compositePhoto({ photos, format, filter, frameColor, frameStyle, layers = [] }) {
  const images = await Promise.all(photos.map(loadImage))
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const fc = frameColor.value
  const fi = filter.css === 'none' ? '' : filter.css
  const fsId = frameStyle?.id ?? 'square'

  function fillFrame() {
    traceFramePath(ctx, canvas.width, canvas.height, fsId)
    ctx.fillStyle = fc
    ctx.fill()
    ctx.save()
    traceFramePath(ctx, canvas.width, canvas.height, fsId)
    ctx.clip()
  }

  switch (format.layout) {
    case 'polaroid': {
      const pw = 600, ph = 600, padSide = 28, padTop = 28, padBottom = 90
      canvas.width = pw + padSide * 2
      canvas.height = ph + padTop + padBottom
      fillFrame()
      ctx.filter = fi; drawCover(ctx, images[0], padSide, padTop, pw, ph); ctx.filter = ''
      ctx.restore()
      break
    }
    case 'vertical-strip': {
      const pw = 500, ph = 334, pad = 20, gap = 8
      canvas.width = pw + pad * 2
      canvas.height = ph * 3 + pad * 2 + gap * 2
      fillFrame()
      images.forEach((img, i) => {
        ctx.filter = fi; drawCover(ctx, img, pad, pad + i * (ph + gap), pw, ph); ctx.filter = ''
      })
      ctx.restore()
      break
    }
    case 'landscape-sequence': {
      const pw = 400, ph = 300, pad = 20, gap = 8
      canvas.width = pw * 3 + pad * 2 + gap * 2
      canvas.height = ph + pad * 2
      fillFrame()
      images.forEach((img, i) => {
        ctx.filter = fi; drawCover(ctx, img, pad + i * (pw + gap), pad, pw, ph); ctx.filter = ''
      })
      ctx.restore()
      break
    }
    case 'modern-grid': {
      const pw = 400, ph = 300, pad = 20, gap = 8
      canvas.width = pw * 2 + pad * 2 + gap
      canvas.height = ph * 2 + pad * 2 + gap
      fillFrame()
      images.forEach((img, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        ctx.filter = fi; drawCover(ctx, img, pad + col * (pw + gap), pad + row * (ph + gap), pw, ph); ctx.filter = ''
      })
      ctx.restore()
      break
    }
    case 'mixed-narrative': {
      const pad = 16, gap = 8
      const innerW = 588
      const topH = Math.round(innerW * 9 / 16)
      const bottomW = Math.round((innerW - gap * 2) / 3)
      const bottomH = Math.round(bottomW * 3 / 4)
      canvas.width = innerW + pad * 2
      canvas.height = pad + topH + gap + bottomH + pad
      fillFrame()
      ctx.filter = fi; drawCover(ctx, images[0], pad, pad, innerW, topH); ctx.filter = ''
      const bottomY = pad + topH + gap
      for (let i = 1; i <= 3 && i < images.length; i++) {
        ctx.filter = fi
        drawCover(ctx, images[i], pad + (i - 1) * (bottomW + gap), bottomY, bottomW, bottomH)
        ctx.filter = ''
      }
      ctx.restore()
      break
    }
  }

  const slots = getCanvasSlots(format.layout, canvas.width, canvas.height)
  const PREVIEW_FRAME_W = { polaroid: 384, 'vertical-strip': 332, 'landscape-sequence': 678, 'modern-grid': 460, 'mixed-narrative': 532 }
  const baseDiameter = (48 / (PREVIEW_FRAME_W[format.layout] ?? 400)) * canvas.width * 0.9
  const outerR = Math.round(baseDiameter * 0.45)
  const innerR = Math.round(baseDiameter * 0.19)
  ;[...layers].reverse().forEach(layer => {
    if (layer.type === 'photo') return
    if (layer.type === 'frame') drawFrameOverlay(ctx, canvas.width, canvas.height, fc, fsId, slots)
    else if (layer.type === 'star') {
      const m = layer.size ?? 1
      drawStarOnCanvas(ctx, layer.x * canvas.width, layer.y * canvas.height, outerR * m, innerR * m)
    }
  })

  if (fsId === 'rounded') {
    ctx.globalCompositeOperation = 'destination-in'
    traceFramePath(ctx, canvas.width, canvas.height, 'rounded')
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }

  return canvas.toDataURL('image/png')
}