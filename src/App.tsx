import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, AudioLines, Check, ChevronDown, FileText, LockKeyhole, Menu, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { museumContent as C, interactions } from './content'

gsap.registerPlugin(ScrollTrigger)

type FileRecord = { id: string; title: string; tag: string; body: string; note: string }
type PhotoRecord = { number: string; title: string; classification: string; caption: string; image: string; rotation: number; stamp?: string }

function useBirthdayCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Build the target as a real instant in Asia/Kolkata (UTC+05:30).
  const date = new Date(now)
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const year = istDate.getFullYear()
  const birthdayStart = new Date(`${year}-11-20T00:00:00+05:30`).getTime()
  const birthdayEnd = new Date(`${year}-11-21T00:00:00+05:30`).getTime()
  const active = now >= birthdayStart && now < birthdayEnd
  const targetYear = now < birthdayStart ? year : year + 1
  const target = new Date(`${targetYear}-11-20T00:00:00+05:30`).getTime()
  const distance = Math.max(0, target - now)
  return {
    active,
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
    targetYear,
  }
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduce ? 0.2 : 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

function PhotoFrame({ photo, specimen = false, index = 0, onOpen }: { photo: PhotoRecord; specimen?: boolean; index?: number; onOpen: (p: PhotoRecord) => void }) {
  const [failed, setFailed] = useState(false)
  return (
    <motion.button
      type="button"
      className={`photo-frame ${specimen ? 'specimen-frame' : 'portrait-frame'}`}
      style={{ ['--tilt' as string]: `${photo.rotation}deg`, ['--frame-index' as string]: index }}
      whileHover={{ y: -9, rotate: photo.rotation * -0.45, scale: 1.018 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(photo)}
      aria-label={`Open ${photo.title}`}
    >
      <div className="photo-mat">
        {!failed ? <img src={photo.image} alt={photo.title} onError={() => setFailed(true)} /> : <div className="photo-placeholder"><span>IMAGE {photo.number}</span><small>ADD PHOTO TO<br/>assets/images</small></div>}
        {specimen && <span className="specimen-stamp">{photo.stamp}</span>}
      </div>
      <div className="photo-caption">
        <span className="micro-label">EXHIBIT {photo.number}</span>
        <strong>{photo.title}</strong>
        <span>{photo.classification}</span>
        <p>{photo.caption}</p>
      </div>
      <span className="frame-open"><ArrowUpRight size={15}/></span>
    </motion.button>
  )
}

export default function App() {
  const countdown = useBirthdayCountdown()
  const [activeFile, setActiveFile] = useState<FileRecord | null>(null)
  const [activePhoto, setActivePhoto] = useState<PhotoRecord | null>(null)
  const [buttonCount, setButtonCount] = useState(0)
  const [generator, setGenerator] = useState('PRESS GENERATE')
  const [objectTurn, setObjectTurn] = useState(0)
  const [questionOpen, setQuestionOpen] = useState<number | null>(null)
  const [secretFound, setSecretFound] = useState(false)
  const [audioOn, setAudioOn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [visitorId] = useState(() => `MP-${Math.floor(1000 + Math.random() * 9000)}`)
  const [showVisitor, setShowVisitor] = useState(false)
  const [toast, setToast] = useState('')
  const [birthdayRevealed, setBirthdayRevealed] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const scrollRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduce) return
      gsap.utils.toArray<HTMLElement>('.parallax-art').forEach((el) => {
        gsap.to(el, {
          yPercent: -13,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        })
      })
      gsap.utils.toArray<HTMLElement>('.section-number').forEach((el) => {
        gsap.fromTo(el, { opacity: 0.12, x: 24 }, {
          opacity: 0.42, x: 0, duration: 1,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })
    }, scrollRef)
    return () => ctx.revert()
  }, [reduce])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
    setMenuOpen(false)
  }

  const enterMuseum = () => {
    setShowVisitor(true)
    scrollTo('grand-gallery')
  }

  const toggleAudio = async () => {
    const audio = audioRef.current
    if (!audio) {
      setToast('Add ambience.mp3 to public/assets/audio to enable the museum ambience.')
      return
    }
    if (audioOn) {
      audio.pause()
      setAudioOn(false)
    } else {
      try {
        await audio.play()
        setAudioOn(true)
      } catch {
        setToast('Audio could not be played. Check the ambience file.')
      }
    }
  }

  const generate = () => {
    const next = interactions[Math.floor(Math.random() * interactions.length)]
    setGenerator(next)
  }

  const clickSecret = () => {
    setSecretFound(true)
    setToast('A restricted record has been added to your visitor file.')
    scrollTo('restricted')
  }

  return (
    <main ref={scrollRef} className="museum-shell">
      <audio ref={audioRef} src="/assets/audio/ambience.mp3" loop preload="none" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <a href="#entrance" className="brand-mini"><span className="brand-symbol">M</span><span>MUSEUM OF PALAK</span></a>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
          <button onClick={() => scrollTo('grand-gallery')}>GALLERY</button>
          <button onClick={() => scrollTo('archives')}>ARCHIVES</button>
          <button onClick={() => scrollTo('interactive')}>INTERACTIVE</button>
          <button onClick={() => scrollTo('restricted')}>RESTRICTED</button>
        </nav>
        <div className="top-actions">
          <button className="audio-toggle" onClick={toggleAudio} aria-label={audioOn ? 'Mute ambience' : 'Play ambience'}>{audioOn ? <Volume2 size={15}/> : <VolumeX size={15}/>}<span>{audioOn ? 'SOUND ON' : 'SOUND OFF'}</span></button>
          <button className="menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button>
        </div>
      </header>

      <section id="entrance" className="hero section-pad">
        <div className="hero-architecture" aria-hidden="true">
          <div className="arch arch-left"/><div className="arch arch-right"/><div className="arch-glow"/>
          <div className="hero-grid"/>
        </div>
        <div className="hero-topline"><span>INDEPENDENT INSTITUTION · EST. 2026</span><span>COLLECTION No. 015</span></div>
        <div className="hero-content">
          <div className="seal-wrap"><div className="seal-orbit"/><div className="seal"><span>M</span><small>MP<br/>015</small></div></div>
          <p className="eyebrow hero-eyebrow">A PERMANENT COLLECTION OF QUESTIONABLE SIGNIFICANCE</p>
          <h1>{C.title.split(' ').map((word, i) => <span key={i}>{word} </span>)}</h1>
          <p className="hero-subtitle">{C.entranceNote}</p>
          <button className="enter-button" onClick={enterMuseum}><span>ENTER THE MUSEUM</span><ArrowDown size={17}/></button>
          <div className="hero-foot"><span>OPEN TO THE PUBLIC</span><span>SCROLL TO EXPLORE ↓</span><span>KANPUR · EVERYWHERE</span></div>
        </div>
        <div className="hero-side-note">THE SUBJECT IS ONE OF A KIND <span>✳</span></div>
        <div className="shinchan-sticker" aria-label="Shinchan museum visitor"><img src="/assets/images/shinchan.png" alt="Shinchan" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}/><span>VISITOR No. 04</span></div>
      </section>

      <section id="grand-gallery" className="exhibition grand-gallery section-pad">
        <div className="section-heading">
          <div><span className="eyebrow">EXHIBITION 01 · PORTRAIT COLLECTION</span><h2>THE GRAND<br/><em>GALLERY.</em></h2></div>
          <p className="section-intro">A selection of officially recognised appearances. Presented with the respect, lighting and unnecessary prestige they deserve.</p>
        </div>
        <div className="gallery-stage">
          <div className="gallery-orbit parallax-art"/><div className="gallery-vertical-label">FIG. 01 — THE ORIGINAL COLLECTION</div>
          <div className="portrait-grid">
            {C.grandGallery.map((p, i) => <PhotoFrame key={p.number} photo={p} index={i} onOpen={setActivePhoto}/>)}
          </div>
          <div className="gallery-footnote"><span>ARCHIVAL PHOTOGRAPHY</span><span>2 WORKS · 1 SUBJECT</span></div>
        </div>
      </section>

      <section id="specimens" className="exhibition specimens section-pad">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">EXHIBITION 02 · ANOMALOUS MATERIAL</span><h2>THE SPECIMEN<br/><em>DEPARTMENT.</em></h2></div>
          <p className="section-intro">Not every discovery can be explained. Some should perhaps not have been submitted for review.</p>
        </div>
        <div className="specimen-layout">
          <div className="specimen-note"><span className="crosshair">✳</span><span className="micro-label">FIELD NOTES · 002</span><p>Evidence has been collected. The committee is still deciding what it means.</p><span className="note-rule"/></div>
          <div className="specimen-grid">
            {C.specimens.map((p, i) => <PhotoFrame key={p.number} photo={p} specimen index={i} onOpen={setActivePhoto}/>)}
          </div>
        </div>
      </section>

      <section id="archives" className="exhibition archives section-pad">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">EXHIBITION 03 · DOCUMENTS & RECORDS</span><h2>THE<br/><em>ARCHIVES.</em></h2></div>
          <p className="section-intro">A growing record of incidents, observations and administrative decisions that seemed important at the time.</p>
        </div>
        <div className="archive-list">
          {C.archiveFiles.map((file, i) => (
            <button className="archive-row" key={file.id} onClick={() => setActiveFile(file)}>
              <span className="archive-file-icon"><FileText size={20}/></span>
              <span className="archive-meta"><small>{file.id}</small><strong>{file.title}</strong><small>{file.tag}</small></span>
              <span className="archive-open">OPEN FILE <ArrowUpRight size={16}/></span>
              <span className="archive-index">0{i + 1}</span>
            </button>
          ))}
        </div>
        <div className="archive-bottom"><span>RECORDS MAY CONTAIN UNVERIFIED INFORMATION</span><span>ACCESS LEVEL: PUBLIC-ISH</span></div>
      </section>

      <section id="interactive" className="exhibition interactive section-pad">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">EXHIBITION 04 · INTERACTIVE INSTALLATIONS</span><h2>PLEASE DO<br/><em>TOUCH.</em></h2></div>
          <p className="section-intro">Unlike the other galleries, visitors are actively encouraged to interfere with the exhibits. The museum accepts no responsibility for the results.</p>
        </div>
        <div className="installation-grid">
          <article className="installation-card button-installation">
            <span className="micro-label">INSTALLATION 01 · THE BUTTON</span>
            <div className="button-stage"><button className="big-museum-button" onClick={() => { setButtonCount(v => v + 1); setToast(interactions[(buttonCount) % interactions.length]) }} aria-label="Press the mysterious button"><span/></button></div>
            <h3>A BUTTON OF<br/>QUESTIONABLE PURPOSE</h3>
            <p>{buttonCount === 0 ? 'It is strongly recommended that you press it.' : `Button pressed ${buttonCount} ${buttonCount === 1 ? 'time' : 'times'}. The committee is monitoring the situation.`}</p>
            <span className="installation-foot">PRESS COUNT: {String(buttonCount).padStart(3, '0')}</span>
          </article>
          <article className="installation-card generator-installation">
            <span className="micro-label">INSTALLATION 02 · RANDOM CLASSIFIER</span>
            <div className="generator-display"><span>CLASSIFICATION OUTPUT</span><p>{generator}</p><div className="scanner-line"/></div>
            <h3>THE PALAK<br/>GENERATOR</h3>
            <p>A completely reliable classification system. Probably.</p>
            <button className="text-button" onClick={generate}>GENERATE RESULT <RotateCcw size={14}/></button>
          </article>
          <article className="installation-card object-installation">
            <span className="micro-label">INSTALLATION 03 · UNKNOWN OBJECT</span>
            <div className="object-stage"><motion.div className="unknown-object" animate={{ rotateY: objectTurn, rotateX: objectTurn * .35 }} transition={{ type: 'spring', stiffness: 75, damping: 12 }}><div className="object-core"/><div className="object-ring ring-a"/><div className="object-ring ring-b"/><div className="object-orb"/></motion.div></div>
            <h3>OBJECT OF<br/>UNKNOWN PURPOSE</h3>
            <p>Rotate the object. It remains uncooperative.</p>
            <button className="text-button" onClick={() => setObjectTurn(v => v + 90)}>ROTATE OBJECT <RotateCcw size={14}/></button>
          </article>
          <article className="installation-card questions-installation">
            <span className="micro-label">INSTALLATION 04 · PUBLIC ENQUIRIES</span>
            <div className="question-list">
              {C.questions.map((item, i) => <div className="question-item" key={item.q}><button onClick={() => setQuestionOpen(questionOpen === i ? null : i)}><span>{item.q}</span><ChevronDown size={16} className={questionOpen === i ? 'turned' : ''}/></button>{questionOpen === i && <p>{item.a}</p>}</div>)}
            </div>
            <h3>THE WALL OF<br/>UNANSWERED QUESTIONS</h3>
            <p>Some questions have answers. This is one of those rare occasions.</p>
          </article>
        </div>
      </section>

      <section id="restricted" className={`exhibition restricted section-pad ${secretFound ? 'restricted-unlocked' : ''}`}>
        <div className="restricted-backdrop parallax-art"/>
        <div className="restricted-inner">
          <span className="eyebrow">EXHIBITION 05 · ACCESS CONTROLLED</span>
          <div className="lock-emblem"><LockKeyhole size={25}/></div>
          <h2>THE RESTRICTED<br/><em>COLLECTION.</em></h2>
          {!secretFound ? <>
            <p className="restricted-copy">One exhibit remains unavailable to the general public. The museum has left a few clues throughout the building.</p>
            <div className="clue-line"><span>CLUE 01</span><span>Some things are easier to find when you stop looking directly at them.</span></div>
            <button className="enter-button restricted-button" onClick={() => { setToast('Hint: inspect the museum seal near the entrance.'); scrollTo('entrance') }}>REQUEST A HINT <ArrowUpRight size={16}/></button>
            <button className="tiny-secret-trigger" onClick={clickSecret} aria-label="Reveal restricted collection">✳</button>
          </> : <motion.div className="unlocked-reveal" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}>
            <span className="access-granted">ACCESS GRANTED · EXHIBIT 015-X</span>
            <h3>{C.finalTitle}</h3>
            <div className="reveal-orb"><div/><span>015-X</span></div>
            <p>{C.finalMessage}</p>
            <strong>{C.finalConclusion}</strong>
            <span className="final-record">FINAL RECORD · PERMANENTLY OPEN</span>
          </motion.div>}
        </div>
      </section>

      <section id="final-installation" className="final-installation section-pad">
        <div className="final-architecture"><div className="final-halo parallax-art"/></div>
        <div className="final-content">
          <span className="eyebrow">THE MUSEUM'S MOST IMPORTANT DATE</span>
          {countdown.active || birthdayRevealed ? <>
            <motion.div className="birthday-live" initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <span className="birthday-spark">✦ ✧ ✦</span>
              <h2>{C.birthdayMessage}</h2>
              <p>THE MUSEUM IS CELEBRATING ITS MOST IMPORTANT ANNUAL EVENT.</p>
              <div className="confetti-field" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ ['--i' as string]: i }}/>)}</div>
            </motion.div>
          </> : <>
            <h2>UNTIL THE<br/><em>CELEBRATION.</em></h2>
            <div className="countdown-grid">
              {[['DAYS', countdown.days], ['HOURS', countdown.hours], ['MINUTES', countdown.minutes], ['SECONDS', countdown.seconds]].map(([label, value]) => <div className="countdown-unit" key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}
            </div>
            <p className="countdown-caption">20 NOVEMBER {countdown.targetYear} · 12:00 AM · INDIA STANDARD TIME</p>
          </>}
          <div className="final-divider"><span/><span className="final-star">✳</span><span/></div>
          <p className="museum-closing">Thank you for visiting the Museum of Palak.<br/>The collection remains open. The explanations remain inconclusive.</p>
          <button className="back-top" onClick={() => scrollTo('entrance')}>RETURN TO ENTRANCE ↑</button>
        </div>
        <footer className="museum-footer"><span>THE MUSEUM OF PALAK · COLLECTION No. 015</span><span>ALL EXHIBITS SUBJECT TO QUESTIONABLE REVIEW</span><span>VISITOR ID: {visitorId}</span></footer>
      </section>

      {showVisitor && <motion.div className="visitor-ticket" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}><span>VISITOR PASS ISSUED</span><strong>{visitorId}</strong><small>WELCOME TO THE COLLECTION</small><button onClick={() => setShowVisitor(false)} aria-label="Dismiss visitor pass"><X size={13}/></button></motion.div>}
      {toast && <motion.div className="toast" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}>{toast}</motion.div>}

      {(activeFile || activePhoto) && <div className="modal-backdrop" onClick={() => { setActiveFile(null); setActivePhoto(null) }}>
        <motion.div className={`detail-modal ${activePhoto ? 'photo-modal' : ''}`} initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => { setActiveFile(null); setActivePhoto(null) }} aria-label="Close"><X/></button>
          {activeFile && <><span className="eyebrow">{activeFile.id} · {activeFile.tag}</span><h2>{activeFile.title}</h2><p>{activeFile.body}</p><div className="modal-note">{activeFile.note}</div><span className="micro-label">END OF RECORD</span></>}
          {activePhoto && <><span className="eyebrow">EXHIBIT {activePhoto.number} · FULL VIEW</span><h2>{activePhoto.title}</h2><img src={activePhoto.image} alt={activePhoto.title}/><p>{activePhoto.caption}</p><span className="micro-label">{activePhoto.classification}</span></>}
        </motion.div>
      </div>}
    </main>
  )
}