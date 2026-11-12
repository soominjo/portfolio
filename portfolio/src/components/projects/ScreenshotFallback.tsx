import type { DeviceSlide } from '../three/devices/deviceTypes'

/** The desktop screenshot on its own, for browsers without WebGL. */
export function ScreenshotFallback({ slide }: { readonly slide: DeviceSlide }) {
  if (!slide.desktopUrl) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <img
        src={slide.desktopUrl}
        alt={`${slide.label} on desktop`}
        className="max-h-full max-w-full rounded-xl border border-indigo-500/25 shadow-2xl light:border-slate-900/10"
      />
    </div>
  )
}
