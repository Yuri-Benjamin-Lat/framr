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

export async function compositePhoto({ photos, format, filter, frameColor, frameStyle }) {
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

  return canvas.toDataURL('image/png')
}