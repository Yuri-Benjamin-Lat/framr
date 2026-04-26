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
    sh = img.height
    sw = sh * slotRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / slotRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export async function compositePhoto({ photos, format, filter, frameColor }) {
  const images = await Promise.all(photos.map(loadImage))
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const fc = frameColor.value
  const fi = filter.css === 'none' ? '' : filter.css

  switch (format.layout) {
    case 'polaroid': {
      const pw = 600, ph = 600
      const padSide = 28, padTop = 28, padBottom = 90
      canvas.width = pw + padSide * 2
      canvas.height = ph + padTop + padBottom
      ctx.fillStyle = fc
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.filter = fi
      drawCover(ctx, images[0], padSide, padTop, pw, ph)
      ctx.filter = ''
      break
    }
    case 'vertical-strip': {
      const pw = 500, ph = 334
      const pad = 20, gap = 8
      canvas.width = pw + pad * 2
      canvas.height = ph * 3 + pad * 2 + gap * 2
      ctx.fillStyle = fc
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      images.forEach((img, i) => {
        ctx.filter = fi
        drawCover(ctx, img, pad, pad + i * (ph + gap), pw, ph)
        ctx.filter = ''
      })
      break
    }
    case 'landscape-sequence': {
      const pw = 400, ph = 300
      const pad = 20, gap = 8
      canvas.width = pw * 3 + pad * 2 + gap * 2
      canvas.height = ph + pad * 2
      ctx.fillStyle = fc
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      images.forEach((img, i) => {
        ctx.filter = fi
        drawCover(ctx, img, pad + i * (pw + gap), pad, pw, ph)
        ctx.filter = ''
      })
      break
    }
    case 'modern-grid': {
      const pw = 400, ph = 300
      const pad = 20, gap = 8
      canvas.width = pw * 2 + pad * 2 + gap
      canvas.height = ph * 2 + pad * 2 + gap
      ctx.fillStyle = fc
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      images.forEach((img, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        ctx.filter = fi
        drawCover(ctx, img, pad + col * (pw + gap), pad + row * (ph + gap), pw, ph)
        ctx.filter = ''
      })
      break
    }
    case 'mixed-narrative': {
      const lw = 500, lh = 500
      const sw = 234, sh = 156
      const pad = 20, gap = 8
      canvas.width = lw + sw + pad * 2 + gap
      canvas.height = lh + pad * 2
      ctx.fillStyle = fc
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.filter = fi
      drawCover(ctx, images[0], pad, pad, lw, lh)
      ctx.filter = ''
      const smallX = pad + lw + gap
      const totalSmall = sh * 3 + gap * 2
      const startY = pad + (lh - totalSmall) / 2
      for (let i = 1; i < images.length; i++) {
        ctx.filter = fi
        drawCover(ctx, images[i], smallX, startY + (i - 1) * (sh + gap), sw, sh)
        ctx.filter = ''
      }
      break
    }
  }

  return canvas.toDataURL('image/png')
}