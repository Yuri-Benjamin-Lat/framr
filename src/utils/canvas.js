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

function getCanvasSlots(layout, w, h) {
  switch (layout) {
    case 'polaroid':
      return [{ x: 38, y: 37, w: w - 76, h: h - 151 }]
    case 'vertical-strip': {
      const pS = 26, pT = 25, pB = 78, gap = 8
      const pw = w - pS * 2
      const ph = Math.round((h - pT - pB - gap * 2) / 3)
      return [0,1,2].map(i => ({ x: pS, y: pT + i*(ph+gap), w: pw, h: ph }))
    }
    case 'landscape-sequence': {
      const pS = 29, pT = 26, pB = 53, gap = 8
      const pw = Math.round((w - pS * 2 - gap * 2) / 3)
      return [0,1,2].map(i => ({ x: pS + i*(pw+gap), y: pT, w: pw, h: h - pT - pB }))
    }
    case 'modern-grid': {
      const pS = 30, pT = 27, pB = 83, gap = 8
      const pw = Math.round((w - pS * 2 - gap) / 2)
      const ph = Math.round((h - pT - pB - gap) / 2)
      return [0,1,2,3].map(i => ({ x: pS + (i%2)*(pw+gap), y: pT + Math.floor(i/2)*(ph+gap), w: pw, h: ph }))
    }
    case 'mixed-narrative': {
      const pS = 19, pT = 19, gap = 8, innerW = w - pS * 2
      const topH = Math.round(innerW * 9/16)
      const bottomW = Math.round((innerW - gap * 2) / 3)
      const bottomH = Math.round(bottomW * 3/4)
      return [
        { x: pS, y: pT, w: innerW, h: topH },
        ...[0,1,2].map(i => ({ x: pS + i*(bottomW+gap), y: pT + topH + gap, w: bottomW, h: bottomH }))
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
      const pS = 38, pT = 37, pB = 114
      canvas.width = 656; canvas.height = 718
      fillFrame()
      ctx.filter = fi; drawCover(ctx, images[0], pS, pT, canvas.width - pS*2, canvas.height - pT - pB); ctx.filter = ''
      ctx.restore()
      break
    }
    case 'vertical-strip': {
      const pS = 26, pT = 25, pB = 78, gap = 8
      canvas.width = 540; canvas.height = 1058
      const pw = canvas.width - pS * 2
      const ph = Math.round((canvas.height - pT - pB - gap * 2) / 3)
      fillFrame()
      images.forEach((img, i) => {
        ctx.filter = fi; drawCover(ctx, img, pS, pT + i * (ph + gap), pw, ph); ctx.filter = ''
      })
      ctx.restore()
      break
    }
    case 'landscape-sequence': {
      const pS = 29, pT = 26, pB = 53, gap = 8
      canvas.width = 1256; canvas.height = 340
      const pw = Math.round((canvas.width - pS * 2 - gap * 2) / 3)
      const ph = canvas.height - pT - pB
      fillFrame()
      images.forEach((img, i) => {
        ctx.filter = fi; drawCover(ctx, img, pS + i * (pw + gap), pT, pw, ph); ctx.filter = ''
      })
      ctx.restore()
      break
    }
    case 'modern-grid': {
      const pS = 30, pT = 27, pB = 83, gap = 8
      canvas.width = 848; canvas.height = 648
      const pw = Math.round((canvas.width - pS * 2 - gap) / 2)
      const ph = Math.round((canvas.height - pT - pB - gap) / 2)
      fillFrame()
      images.forEach((img, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        ctx.filter = fi; drawCover(ctx, img, pS + col * (pw + gap), pT + row * (ph + gap), pw, ph); ctx.filter = ''
      })
      ctx.restore()
      break
    }
    case 'mixed-narrative': {
      const pS = 19, pT = 19, pB = 58, gap = 8
      const innerW = 582
      const topH = Math.round(innerW * 9 / 16)
      const bottomW = Math.round((innerW - gap * 2) / 3)
      const bottomH = Math.round(bottomW * 3 / 4)
      canvas.width = innerW + pS * 2
      canvas.height = pT + topH + gap + bottomH + pB
      fillFrame()
      ctx.filter = fi; drawCover(ctx, images[0], pS, pT, innerW, topH); ctx.filter = ''
      const bottomY = pT + topH + gap
      for (let i = 1; i <= 3 && i < images.length; i++) {
        ctx.filter = fi
        drawCover(ctx, images[i], pS + (i - 1) * (bottomW + gap), bottomY, bottomW, bottomH)
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
