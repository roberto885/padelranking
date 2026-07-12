import Link from "next/link";

export default function OfflinePage() {
  return <main className="offline-page"><div className="offline-mark">P</div><p className="eyebrow">SIN CONEXIÓN</p><h1>La cancha sigue. Tu conexión volverá.</h1><p>Puedes consultar la información que abriste recientemente. Para enviar o confirmar un marcador, vuelve a conectarte.</p><Link href="/">Intentar de nuevo</Link></main>;
}
