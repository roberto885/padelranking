import { demoPublicEvent } from "@/server/public/event-view";
import Link from "next/link";

export default function PublicEventPage() {
  const event = demoPublicEvent;
  return <main className="public-event">
    <header className="event-top"><Link className="brand" href="/"><span className="brand-mark">P</span>Punto</Link><a className="login-link" href="#">Iniciar sesión</a></header>
    <section className="event-hero"><div className="event-wrap"><div><span className="live-pill"><i/> EN VIVO</span><p className="eyebrow">{event.club}</p><h1>{event.name}</h1><p>{event.dateLabel} · {event.location}</p></div><button className="share">Compartir evento</button></div></section>
    <div className="event-tabs"><div className="event-wrap"><a className="selected" href="#live">En vivo</a><a href="#schedule">Calendario</a><a href="#standings">Clasificación</a><a href="#players">Jugadores</a></div></div>
    <div className="event-wrap event-content"><div className="category-row"><div><span>Categoría</span>{event.categories.map(x=><button className={x===event.category?"chosen":""} key={x}>{x}</button>)}</div><small>Actualizado hace unos segundos</small></div>
      <section id="live"><div className="event-heading"><div><p className="eyebrow">ESTADO DE CANCHAS</p><h2>Partidos en curso</h2></div><span>{event.courts.filter(c=>c.state==="live").length} en vivo</span></div><div className="court-grid">{event.courts.map(c=><article className={`public-court ${c.state}`} key={c.court}><div><strong>{c.court}</strong><span>{c.state==="live"?"EN JUEGO":"SIGUIENTE"}</span></div><p>{c.team1}</p><b>{c.score??c.time}</b><p>{c.team2}</p>{c.state==="live"&&<small>Ronda 2 · A 32 puntos</small>}</article>)}</div></section>
      <div className="public-grid"><section id="schedule"><div className="event-heading"><h2>Próximos partidos</h2><a href="#">Ver calendario completo</a></div><div className="public-card">{event.schedule.map(m=><div className="public-match" key={`${m.time}-${m.court}`}><time>{m.time}</time><div><span>{m.round} · {m.court}</span><strong>{m.team1} <i>vs</i> {m.team2}</strong></div><b className={m.status}>{m.score??"Programado"}</b></div>)}</div></section>
      <section id="standings"><div className="event-heading"><h2>Clasificación</h2><a href="#">Ver detalles</a></div><div className="public-card standing-table"><div className="standing-head"><span>#</span><span>Jugador</span><span>PJ</span><span>PG</span><span>PTS</span></div>{event.standings.map(s=><div className="standing-row" key={s.team}><b>{s.rank}</b><strong>{s.team}</strong><span>{s.played}</span><span>{s.won}</span><span>{s.points} <small>+{s.difference}</small></span></div>)}</div></section></div>
    </div><footer className="public-footer"><span>Punto Club · Resultados oficiales del evento</span><span>Español · México</span></footer>
  </main>;
}
