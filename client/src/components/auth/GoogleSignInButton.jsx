import { useEffect, useRef } from 'react'

export default function GoogleSignInButton({ onCredential }) {
  const btnRef = useRef(null)

  useEffect(() => {
    if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (res) => onCredential(res.credential),
    })

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: 320,
    })
  }, [])

  return <div ref={btnRef} className="flex justify-center" />
}
