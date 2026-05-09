import { useState, useEffect } from 'react'
import { FORMATS, FILTERS, FRAME_COLORS, FRAME_STYLES } from './data/formats'
import Sidebar from './components/Sidebar'
import ChooseFormat from './components/ChooseFormat'
import CameraStep from './components/CameraStep'
import CustomizeStep from './components/CustomizeStep'
import SaveShareStep from './components/SaveShareStep'
import SplashScreen from './components/SplashScreen'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [step, setStep] = useState(1)
  const [format, setFormat] = useState(FORMATS[0])
  const [photos, setPhotos] = useState([])
  const [filter, setFilter] = useState(FILTERS[0])
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0])
  const [frameStyle, setFrameStyle] = useState(FRAME_STYLES[0])
  const [layers, setLayers] = useState([
    { id: 'photo', type: 'photo', label: 'Photo' },
    { id: 'frame', type: 'frame', label: 'Frame' },
  ])
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  function toggleDark() {
    setIsDark(d => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  function goNext() { setStep(s => Math.min(s + 1, 4)) }
  function goBack() { setStep(s => Math.max(s - 1, 1)) }

  function goBackFromCustomize() {
    setPhotos([])
    setStep(2)
  }

  function restart() {
    setStep(1)
    setPhotos([])
    setFilter(FILTERS[0])
    setFrameColor(FRAME_COLORS[0])
    setFrameStyle(FRAME_STYLES[0])
    setLayers([{ id: 'photo', type: 'photo', label: 'Photo' }, { id: 'frame', type: 'frame', label: 'Frame' }])
    setFormat(FORMATS[0])
  }

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f5f0ea] dark:bg-[#191210]">
      <Sidebar step={step} isDark={isDark} toggleDark={toggleDark} />
      <main className="flex-1 overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
        {step === 1 && (
          <ChooseFormat format={format} onSelect={setFormat} onNext={goNext} />
        )}
        {step === 2 && (
          <CameraStep
            format={format}
            photos={photos}
            onPhotosChange={setPhotos}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 3 && (
          <CustomizeStep
            format={format}
            photos={photos}
            filter={filter}
            frameColor={frameColor}
            frameStyle={frameStyle}
            onFilterChange={setFilter}
            onFrameColorChange={setFrameColor}
            onFrameStyleChange={setFrameStyle}
            onPhotosChange={setPhotos}
            layers={layers}
            onLayersChange={setLayers}
            onNext={goNext}
            onBack={goBackFromCustomize}
          />
        )}
        {step === 4 && (
          <SaveShareStep
            format={format}
            photos={photos}
            filter={filter}
            frameColor={frameColor}
            frameStyle={frameStyle}
            layers={layers}
            onRestart={restart}
            onBack={goBack}
          />
        )}
      </main>
    </div>
  )
}