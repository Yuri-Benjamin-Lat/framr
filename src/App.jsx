import { useState } from 'react'
import { FORMATS, FILTERS, FRAME_COLORS } from './data/formats'
import Sidebar from './components/Sidebar'
import ChooseFormat from './components/ChooseFormat'
import CameraStep from './components/CameraStep'
import CustomizeStep from './components/CustomizeStep'
import SaveShareStep from './components/SaveShareStep'

export default function App() {
  const [step, setStep] = useState(1)
  const [format, setFormat] = useState(FORMATS[0])
  const [photos, setPhotos] = useState([])
  const [filter, setFilter] = useState(FILTERS[0])
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0])

  function goNext() { setStep(s => Math.min(s + 1, 4)) }
  function goBack() { setStep(s => Math.max(s - 1, 1)) }

  function restart() {
    setStep(1)
    setPhotos([])
    setFilter(FILTERS[0])
    setFrameColor(FRAME_COLORS[0])
    setFormat(FORMATS[0])
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f0ea]">
      <Sidebar step={step} />
      <main className="flex-1 overflow-hidden">
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
            onFilterChange={setFilter}
            onFrameColorChange={setFrameColor}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 4 && (
          <SaveShareStep
            format={format}
            photos={photos}
            filter={filter}
            frameColor={frameColor}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  )
}