import { registerSW } from "virtual:pwa-register"

export const registerPWA = () => {
  if (!("serviceWorker" in navigator)) {
    return
  }

  registerSW({
    immediate: true,
  })
}
