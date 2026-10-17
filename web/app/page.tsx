'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as RPointerEvent, ReactNode } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronLeft, Copy, Heart, Info, Mic, Pause, Phone, Play, RefreshCw, RotateCcw, ShieldCheck, Sparkles, Volume2, Waves, Wind, X } from 'lucide-react'

type Lang = 'hi' | 'en'
type Screen = 'home' | 'checkin' | 'result' | 'insights'
type Tier = 'green' | 'amber' | 'red'
type Question = { id: string; domain: string; text: string }
type Scores = { phq2: number; gad2: number; sleep: number }
type Result = { tier: Tier; headline: string; body: string; tips: { id?: string; title: string; text: string }[]; trace: { agent: string; detail: string }[]; scores?: Scores; offline?: boolean }
type Burst = { id: number; x: number; y: number; items: { dx: number; dy: number; r: number; s: number; c: number }[] }

const COPY = {
  hi: {
    home: 'होम', navInsights: 'साथ में बेहतर', breathe: 'सांस लें',
    eyebrow: 'आपके लिए, हर दिन', hero: 'अरे, एक सांस लेते हैं।', sub: 'बस पांच छोटे सवाल। बोलकर या छूकर जवाब दें। यह जगह आपकी है।',
    start: 'शुरू करें', explore: 'कम्युनिटी की झलक देखें', privacy: 'आपकी बातें निजी रहती हैं', privacySub: 'कोई जजमेंट नहीं। कोई मुश्किल शब्द नहीं।',
    brandLine: 'आप कैसा महसूस कर रहे हैं, उसके लिए थोड़ी जगह।',
    affirm: ['आप कैसा महसूस कर रहे हैं, उसके लिए थोड़ी जगह।', 'आप जैसे हैं, वैसे ठीक हैं।', 'थोड़ा रुकना भी आगे बढ़ना है।', 'आज एक छोटा कदम काफ़ी है।'],
    chipListen: 'सुनना', chipBreathe: 'सांस',
    question: 'सवाल', almost: 'लगभग हो गया', listen: 'सवाल सुनें', listening: 'सुन रहे हैं…', ready: 'जवाब देने के लिए बोलें या नीचे से चुनें', tap: 'या नीचे से एक जवाब चुनें',
    back: 'वापस', next: 'आगे', skip: 'छोड़ें', speakBtn: 'बोलकर बताएं', stopBtn: 'रोकें',
    freeTitle: 'कुछ और कहना है?', freeHint: 'यह वैकल्पिक है। लिखें या बोलकर बताएं।', freePh: 'यहाँ लिखें…', seeResult: 'नतीजा देखें',
    heard: 'सुन लिया', notCaught: 'समझ नहीं आया। कृपया नीचे से चुनें।', micDenied: 'माइक की अनुमति नहीं मिली। नीचे से जवाब चुनें।', unsupported: 'इस ब्राउज़र में आवाज़ का विकल्प उपलब्ध नहीं है। नीचे से जवाब चुनें।',
    loadMsgs: ['आपके जवाब धीरे से पढ़ रहे हैं…', 'छोटे, काम के सुझाव ढूँढ रहे हैं…', 'बस एक पल…'],
    tier: { green: 'हल्का और ठीक', amber: 'थोड़ा सहारा', red: 'अभी मदद ज़रूरी है' },
    emergency: 'तुरंत खतरा है? 112 पर कॉल करें', tele: 'Tele-MANAS से बात करें', copyNum: 'नंबर कॉपी करें', copied: 'कॉपी हो गया',
    tipsTitle: 'आज़माने के लिए छोटे सुझाव', tried: (n: number, m: number) => `${n}/${m} आज़माए`,
    meters: { mood: 'मन', worry: 'चिंता', rest: 'नींद/थकान' }, yourCheckin: 'आपका चेक-इन',
    offline: 'सर्वर से कनेक्शन नहीं हुआ, इसलिए नतीजा इसी ब्राउज़र में निकाला गया। कुछ भी सहेजा नहीं गया।',
    agents: 'एजेंट्स ने क्या किया', again: 'फिर से शुरू करें', disclaimer: 'स्क्रीनिंग और सहायता का टूल, निदान या इलाज नहीं।',
    insightsTitle: 'साथ में थोड़ा बेहतर।', insightsSub: 'हमारी कम्युनिटी कैसा महसूस कर रही है, उसकी एक शांत झलक।', total: 'कुल चेक-इन', allTime: 'अब तक', themes: 'बातें जिन पर लोग सोच रहे हैं',
    notEnough: 'अभी पर्याप्त जानकारी नहीं है।', privacyInsights: 'निजता बचाने के लिए, आंकड़े पर्याप्त जवाब आने के बाद दिखेंगे।', refresh: 'ताज़ा करें', tryCheckin: 'चेक-इन करें', tapBar: 'किसी बार को छूकर देखें',
    ofTotal: (n: number, total: number, pct: number) => `${total} में से ${n} चेक-इन (${pct}%)`,
    tierName: { green: 'हल्के दिन', amber: 'थोड़ा सहारा', red: 'मदद ज़रूरी' },
    aboutTitle: 'आपकी निजता और सुरक्षा',
    about: ['Mello एक स्क्रीनिंग और सहायता टूल है। यह निदान या इलाज नहीं करता।', 'आपकी बातें सिर्फ़ नतीजा बनाने के लिए पढ़ी जाती हैं, सहेजी नहीं जातीं। केवल स्तर और विषय के लेबल रखे जाते हैं, नाम या फ़ोन नंबर नहीं।', 'अगर आप खतरे में हो सकते हैं, तो Mello हमेशा किसी इंसान तक पहुँचाता है: Tele-MANAS 14416 (मुफ़्त, 24x7) या 112।', 'सुझाव एक जाँची हुई सूची से आते हैं, AI अपने मन से नहीं बनाता। यह प्रोटोटाइप अभी किसी डॉक्टर की समीक्षा का इंतज़ार कर रहा है।'],
    bTitle: 'एक मिनट, बस सांस', bHint: '4 गिनती में अंदर, 6 में बाहर।', bReady: 'तैयार हों', bIn: 'सांस लें', bOut: 'धीरे छोड़ें', bStart: 'शुरू', bPause: 'रोकें', bResume: 'जारी रखें', bDone: 'बहुत अच्छा।', bDoneBody: 'आपने पूरा एक मिनट अपने लिए निकाला।', bAgain: 'एक बार और', close: 'बंद करें',
  },
  en: {
    home: 'Home', navInsights: 'Better together', breathe: 'Breathe',
    eyebrow: 'A softer moment, for you', hero: 'Hey, take a breath.', sub: 'Just five little questions. You can speak or tap. This space is yours.',
    start: "Let's begin", explore: 'See community insights', privacy: 'Your words stay private', privacySub: 'No judgement. No complicated words.',
    brandLine: 'A little space for how you feel.',
    affirm: ['A little space for how you feel.', 'You are allowed to take it slow.', 'Pausing is also progress.', 'One small step is enough today.'],
    chipListen: 'listen', chipBreathe: 'breathe',
    question: 'Question', almost: 'Almost there', listen: 'Hear the question', listening: 'Listening…', ready: 'Speak your answer, or choose below', tap: 'Or choose one below',
    back: 'Back', next: 'Next', skip: 'Skip', speakBtn: 'Speak', stopBtn: 'Stop',
    freeTitle: 'Anything else on your mind?', freeHint: 'Totally optional. Type it, or say it out loud.', freePh: 'Write here…', seeResult: 'See my result',
    heard: 'Heard you', notCaught: "Didn't catch that. Please tap an answer.", micDenied: 'Microphone permission was not available. Choose an answer below.', unsupported: 'Voice is not available in this browser. Choose an answer below.',
    loadMsgs: ['Reading your answers gently…', 'Finding small things that may help…', 'Just a moment…'],
    tier: { green: 'A gentler day', amber: 'A little support', red: 'Support matters now' },
    emergency: 'In immediate danger? Call 112', tele: 'Talk to Tele-MANAS', copyNum: 'Copy number', copied: 'Copied',
    tipsTitle: 'Small things to try', tried: (n: number, m: number) => `${n} of ${m} tried`,
    meters: { mood: 'Mood', worry: 'Worry', rest: 'Sleep & energy' }, yourCheckin: 'Your check-in',
    offline: 'Couldn’t reach the server, so this result was worked out right here in your browser. Nothing was saved.',
    agents: 'What the agents did', again: 'Start again', disclaimer: 'Screening and support tool, not a diagnosis or treatment.',
    insightsTitle: 'A little better, together.', insightsSub: 'A gentle glimpse of how our community is feeling.', total: 'Total check-ins', allTime: 'all time', themes: 'What people are carrying',
    notEnough: 'Not enough data yet.', privacyInsights: 'Community insights appear once enough people have checked in, to protect privacy.', refresh: 'Refresh', tryCheckin: 'Take a check-in', tapBar: 'Tap a bar to see more',
    ofTotal: (n: number, total: number, pct: number) => `${n} of ${total} check-ins (${pct}%)`,
    tierName: { green: 'Gentler days', amber: 'A little support', red: 'Support matters' },
    aboutTitle: 'Your privacy & safety',
    about: ['Mello is a screening and support tool. It does not diagnose or treat.', 'Your words are read only to build your result and are not stored. Just a level and theme labels are kept, never a name or phone number.', 'If you may be in danger, Mello always points you to a person: Tele-MANAS 14416 (free, 24x7) or 112.', 'Tips come from a reviewed list, not invented by AI. This prototype still needs a clinician’s review.'],
    bTitle: 'One minute, just breathe', bHint: 'In for 4, out for 6.', bReady: 'Get comfortable', bIn: 'Breathe in', bOut: 'Slowly out', bStart: 'Start', bPause: 'Pause', bResume: 'Resume', bDone: 'Nicely done.', bDoneBody: 'You gave yourself a whole minute.', bAgain: 'Once more', close: 'Close',
  },
}
type Copy = typeof COPY.en

const DOMAIN: Record<Lang, Record<string, string>> = { hi: { mood: 'मन', anxiety: 'चिंता', sleep: 'नींद' }, en: { mood: 'Mood', anxiety: 'Worry', sleep: 'Sleep' } }
const THEME: Record<Lang, Record<string, string>> = {
  hi: { sleep: 'नींद/थकान', money: 'पैसे', family: 'परिवार', work: 'काम', lonely: 'अकेलापन', mood: 'उदास मन', anx: 'चिंता' },
  en: { sleep: 'Sleep/fatigue', money: 'Money', family: 'Family', work: 'Work', lonely: 'Loneliness', mood: 'Low mood', anx: 'Worry' },
}

// Same five questions as data/questions.json. The backend copy wins when reachable.
const QUESTIONS: Record<Lang, Question[]> = {
  hi: [
    { id: 'q1', domain: 'mood', text: 'पिछले 2 हफ्तों में कितनी बार किसी काम में मन नहीं लगा या खुशी नहीं मिली?' },
    { id: 'q2', domain: 'mood', text: 'कितनी बार उदास, निराश या बेकार महसूस हुआ?' },
    { id: 'q3', domain: 'anxiety', text: 'कितनी बार घबराहट, बेचैनी या तनाव महसूस हुआ?' },
    { id: 'q4', domain: 'anxiety', text: 'कितनी बार चिंता को रोक नहीं पाए?' },
    { id: 'q5', domain: 'sleep', text: 'कितनी बार नींद नहीं आई या बहुत थकान रही?' },
  ],
  en: [
    { id: 'q1', domain: 'mood', text: 'Over the last 2 weeks, how often have you had little interest or joy in doing things?' },
    { id: 'q2', domain: 'mood', text: 'How often have you felt down, low or hopeless?' },
    { id: 'q3', domain: 'anxiety', text: 'How often have you felt nervous, anxious or on edge?' },
    { id: 'q4', domain: 'anxiety', text: 'How often have you been unable to stop or control worrying?' },
    { id: 'q5', domain: 'sleep', text: 'How often have you had trouble sleeping or felt very tired?' },
  ],
}
const OPTIONS: Record<Lang, string[]> = {
  hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज़्यादा दिन', 'लगभग रोज़'],
  en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
}

/* ---------- offline fallback: mirrors the Python rules so a dead server never hides a crisis ---------- */
const CRISIS = /suicid|kill(ing)? myself|end(ing)? (my life|it all)|want(s)? to die|wanna die|no reason to live|not worth living|(do not|don'?t|dont|no longer) want to live(?!\s+(in|near|with|here|there|at)\b)|(hurt|harm)(ing)? myself|better off without me|mar(na|ne)\s+chah|mar jaun|mar jana|jee?na nahi|jina nahi|jeene ka (koi )?matlab nahi|khud ko khatam|jaan (dena|de dunga|de dungi)|apni jaan|khud ko nuksan|atmahatya|मरना चाह|मर जाऊँ|मर जाना|जीना नहीं|जीने का (कोई )?मतलब नहीं|खुद को (खत्म|खतम)|जान दे|आत्महत्या|खुद को नुकसान|मेरे बिना सब बेहतर/i
const THEME_RX: Record<string, RegExp> = {
  sleep: /sleep|tired|neend|thak|नींद|थक/i, money: /money|salary|debt|paisa|paise|karz|कर्ज|पैसे|उधार/i,
  family: /family|ghar|parivar|परिवार|घर/i, work: /work|boss|shift|kaam|काम|मालिक/i, lonely: /alone|lonely|akela|अकेल/i,
}
const REPLY: Record<Lang, Record<Tier, [string, string]>> = {
  hi: { green: ['सब ठीक चल रहा है', 'आपका ध्यान रखना अच्छा है। ये छोटे सुझाव मदद कर सकते हैं।'], amber: ['थोड़ा बोझ दिख रहा है', 'आप अकेले नहीं हैं। किसी से बात करना मदद करेगा। ये सुझाव आज़माइए।'], red: ['अभी किसी इंसान से बात करें', 'आपकी बात बहुत मायने रखती है। कृपया अभी Tele-MANAS पर कॉल करें। यह मुफ़्त है और 24x7 चलता है।'] },
  en: { green: ['You seem to be doing okay', 'Looking after yourself matters. These small tips may help.'], amber: ['You seem to be carrying a lot', 'You are not alone. Talking to someone can help. Try these tips.'], red: ['Please talk to a person now', 'What you are feeling matters. Please call Tele-MANAS now. It is free and open 24x7.'] },
}
const KB = [
  { id: 'K1', tags: ['anx'], en: ['Slow breathing', 'Breathe in for 4 counts, out for 6, for 2 minutes. Try it before a shift or while waiting, when it is safe.'], hi: ['धीमी साँस', '4 गिनती में साँस लें, 6 में छोड़ें, 2 मिनट तक। शिफ्ट से पहले या इंतज़ार में, जब सुरक्षित हो।'] },
  { id: 'K2', tags: ['sleep'], en: ['Fixed sleep time', 'Sleep and wake at similar times, keep the phone away for 30 minutes before bed, and nap only before 4 pm.'], hi: ['सोने का तय समय', 'लगभग रोज़ एक ही समय सोएँ-उठें, सोने से 30 मिनट पहले फ़ोन दूर रखें, झपकी 4 बजे से पहले लें।'] },
  { id: 'K3', tags: ['mood', 'lonely', 'family'], en: ['Tell one person', 'Choose one person you trust and tell them one honest thing about how you feel this week.'], hi: ['एक इंसान से कहें', 'किसी भरोसेमंद व्यक्ति को चुनें और इस हफ्ते आप कैसा महसूस कर रहे हैं, एक सच्ची बात बताएँ।'] },
  { id: 'K4', tags: ['mood'], en: ['One small joy', 'Spend 10 minutes on something you used to enjoy: a walk, a song, tea with a friend.'], hi: ['एक छोटी खुशी', '10 मिनट कोई पसंदीदा काम करें: टहलना, गाना, दोस्त के साथ चाय।'] },
  { id: 'K5', tags: ['money'], en: ['Money worries', 'Write your three biggest money worries and one small step for each. Ask your NGO or union about support schemes.'], hi: ['पैसों की चिंता', 'अपनी तीन सबसे बड़ी चिंताएँ लिखें और हर एक के लिए एक छोटा कदम। अपने NGO या यूनियन से सहायता योजनाओं के बारे में पूछें।'] },
]

function offlineEvaluate(lang: Lang, a: number[], text: string): Result {
  const scores = { phq2: a[0] + a[1], gad2: a[2] + a[3], sleep: a[4] }
  const crisis = CRISIS.test(text.replace(/\u2019/g, "'").toLowerCase())
  const tier: Tier = crisis ? 'red' : scores.phq2 >= 3 || scores.gad2 >= 3 ? 'amber' : 'green'
  const themes: string[] = []
  if (scores.phq2 >= 2) themes.push('mood')
  if (scores.gad2 >= 2) themes.push('anx')
  if (scores.sleep >= 2) themes.push('sleep')
  Object.keys(THEME_RX).forEach(k => { if (text && THEME_RX[k].test(text) && !themes.includes(k)) themes.push(k) })
  let picks = KB.map(k => ({ k, s: k.tags.filter(x => themes.includes(x)).length })).filter(x => x.s > 0).sort((x, y) => y.s - x.s).slice(0, 2).map(x => x.k)
  if (!picks.length) picks = [KB[0], KB[2]]
  const [headline, body] = REPLY[lang][tier]
  return {
    tier, headline, body, scores, offline: true,
    tips: picks.map(k => ({ id: k.id, title: k[lang][0], text: k[lang][1] })),
    trace: [
      { agent: 'Screening Agent', detail: `PHQ-2 ${scores.phq2}/6, GAD-2 ${scores.gad2}/6, sleep item ${scores.sleep}/3` },
      { agent: 'Safety and Triage Agent', detail: crisis ? 'Crisis phrase found: rule override to RED' : `No crisis phrase. Tier by scores: ${tier.toUpperCase()}` },
      { agent: 'Offline mode', detail: 'Server unreachable. Same rules ran in the browser; nothing was stored.' },
    ],
  }
}

// Same word lists as screening.py so spoken answers behave identically.
function parseSpoken(s: string): number {
  s = s.toLowerCase().trim()
  if (/^[0-3]$/.test(s)) return Number(s)
  if (/every ?day|nearly|daily|always|roz|har din|रोज|हमेशा|लगभग/.test(s)) return 3
  if (/half|often|many|adhe|aksar|आधे|अक्सर|ज़्यादा|ज्यादा/.test(s)) return 2
  if (/several|few|some|kuch|kabhi kabhi|कुछ|कभी कभी|कभी-कभी/.test(s)) return 1
  if (/not at all|never|\bno\b|nahi|bilkul|नहीं|बिल्कुल/.test(s)) return 0
  return -1
}

const mapApi = (d: any): Result => ({
  tier: d.tier, headline: d.reply?.headline ?? '', body: d.reply?.body ?? '', scores: d.scores,
  tips: (d.tips || []).map((k: any) => ({ id: k.id, title: k.title, text: k.text })), trace: d.trace || [],
})

/* ---------- small hooks / pieces ---------- */
function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => { const id = requestAnimationFrame(() => requestAnimationFrame(() => setM(true))); return () => cancelAnimationFrame(id) }, [])
  return m
}
function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0; const t0 = performance.now()
    const tick = (n: number) => { const p = Math.min(1, (n - t0) / 1100); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{v}</>
}
function Logo() { return <div className="logo"><span className="logo-mark"><i /><i /></span><b>Mello</b></div> }
const delay = (ms: number): CSSProperties => ({ ['--d' as any]: `${ms}ms` })

function Sheet({ title, onClose, closeLabel, className, children }: { title: string; onClose: () => void; closeLabel: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return <div className="sheet-back" onClick={onClose}>
    <div className={`sheet ${className ?? ''}`} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
      <button ref={ref} className="sheet-x" onClick={onClose} aria-label={closeLabel}><X /></button>
      <h2>{title}</h2>{children}
    </div>
  </div>
}

function BreatheGuide({ t, onClose }: { t: Copy; onClose: () => void }) {
  const TOTAL = 50 // five 10-second cycles
  const [running, setRunning] = useState(false)
  const [sec, setSec] = useState(0)
  const [round, setRound] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSec(s => { if (s + 1 >= TOTAL) { setRunning(false); return TOTAL } return s + 1 }), 1000)
    return () => clearInterval(id)
  }, [running])
  const done = sec >= TOTAL
  const c = sec % 10, inhale = c < 4, left = inhale ? 4 - c : 10 - c
  const again = () => { setSec(0); setRound(r => r + 1); setRunning(true) }
  return <Sheet title={t.bTitle} onClose={onClose} closeLabel={t.close} className="breathe">
    <p>{t.bHint}</p>
    {done ? <div className="b-done"><div className="loading-orb"><Heart /></div><h2 style={{ padding: 0, margin: '14px 0 0' }}>{t.bDone}</h2><p>{t.bDoneBody}</p></div>
      : <div key={round} className={`b-stage ${running ? 'running' : ''}`}>
        <div className="b-orb" />
        <div className="b-text">{running || sec > 0 ? <><strong key={String(inhale)}>{inhale ? t.bIn : t.bOut}</strong><span>{left}</span></> : <strong>{t.bReady}</strong>}</div>
      </div>}
    <div className="b-dots">{[0, 1, 2, 3, 4].map(i => <i key={i} className={i < Math.floor(sec / 10) ? 'on' : i === Math.floor(sec / 10) && !done ? 'cur' : ''} />)}</div>
    <div className="b-actions">
      {done ? <button className="primary-action" onClick={again}><RotateCcw />{t.bAgain}</button>
        : <button className="primary-action" onClick={() => setRunning(r => !r)}>{running ? <Pause /> : <Play />}{running ? t.bPause : sec > 0 ? t.bResume : t.bStart}</button>}
      <button className="ghost-btn" onClick={onClose}>{t.close}</button>
    </div>
  </Sheet>
}

/* ---------- page ---------- */
export default function Page() {
  const [lang, setLang] = useState<Lang>('hi')
  const [screen, setScreen] = useState<Screen>('home')
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS.hi)
  const [options, setOptions] = useState<string[]>(OPTIONS.hi)
  const [index, setIndex] = useState(0) // 0-4 questions, 5 = optional free text
  const [reached, setReached] = useState(0)
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const [answers, setAnswers] = useState<number[]>([])
  const [freeText, setFreeText] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState(0)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceMsg, setVoiceMsg] = useState('')
  const [insights, setInsights] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [wipe, setWipe] = useState(false)
  const [about, setAbout] = useState(false)
  const [breathe, setBreathe] = useState(false)
  const [toast, setToast] = useState('')
  const [bursts, setBursts] = useState<Burst[]>([])
  const [orbPop, setOrbPop] = useState(0)
  const [affirmIdx, setAffirmIdx] = useState(0)

  const t = COPY[lang]
  const answersRef = useRef<number[]>([]); const indexRef = useRef(0); indexRef.current = index
  const lockRef = useRef(false); const busyRef = useRef(false); const recRef = useRef<any>(null)
  const idRef = useRef(0); const toastTimer = useRef<any>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const setAns = (a: number[]) => { answersRef.current = a; setAnswers(a) }
  const showToast = (m: string) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 1800) }
  const burst = (x: number, y: number, n = 10) => {
    const id = ++idRef.current
    const items = Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2 + Math.random() * 0.6, d = 50 + Math.random() * 80; return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - 30, r: Math.random() * 360, s: 0.6 + Math.random() * 0.8, c: k % 4 } })
    setBursts(b => [...b, { id, x, y, items }]); setTimeout(() => setBursts(b => b.filter(z => z.id !== id)), 1300)
  }
  const stopVoice = () => { try { recRef.current?.stop() } catch {} recRef.current = null; setListening(false); if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); setSpeaking(false) }

  // curtain transition between screens
  const go = (s: Screen, before?: () => void) => {
    if (busyRef.current) return
    busyRef.current = true; stopVoice(); setWipe(true)
    setTimeout(() => { before?.(); setScreen(s); window.scrollTo({ top: 0 }) }, 420)
    setTimeout(() => setWipe(false), 470)
    setTimeout(() => { busyRef.current = false }, 900)
  }
  const resetState = () => { setAns([]); setIndex(0); setReached(0); setFreeText(''); setResult(null); setLoading(false); setVoiceMsg(''); setDir('fwd'); lockRef.current = false }

  const start = () => go('checkin', resetState)
  const goHome = () => { if (screen === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); setOrbPop(n => n + 1) } else go('home', resetState) }
  const loadInsights = async () => { setRefreshing(true); try { const r = await fetch('/api/insights'); if (r.ok) setInsights(await r.json()) } catch {} setTimeout(() => setRefreshing(false), 600) }
  const showInsights = () => { if (screen === 'insights') { loadInsights(); return } go('insights'); loadInsights() }
  const goTo = (i: number) => { setDir(i > indexRef.current ? 'fwd' : 'back'); setIndex(i); setVoiceMsg(''); setReached(r => Math.max(r, i)) }
  const back = () => { if (index > 0) goTo(index - 1); else go('home', resetState) }

  const choose = (v: number, e?: { clientX: number; clientY: number }) => {
    if (lockRef.current || indexRef.current > 4) return
    lockRef.current = true
    const i = indexRef.current; const next = [...answersRef.current]; next[i] = v; setAns(next); setVoiceMsg('')
    if (e) burst(e.clientX, e.clientY, 8)
    setTimeout(() => { lockRef.current = false; setDir('fwd'); setIndex(i + 1); setReached(r => Math.max(r, i + 1)) }, 440)
  }

  const submit = async () => {
    if (loading) return
    stopVoice(); setLoading(true); setLoadMsg(0)
    const a = answersRef.current.slice(0, 5); const began = Date.now()
    let r: Result
    try {
      const res = await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang, answers: a, free_text: freeText }) })
      if (!res.ok) throw new Error(String(res.status))
      r = mapApi(await res.json())
    } catch { r = offlineEvaluate(lang, a, freeText) }
    setTimeout(() => go('result', () => { setResult(r); setLoading(false) }), Math.max(0, 1900 - (Date.now() - began)))
  }

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    if (speaking) { stopVoice(); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false)
    setSpeaking(true); window.speechSynthesis.speak(u)
  }
  const listen = () => {
    const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!R) { setVoiceMsg(t.unsupported); return }
    if (recRef.current) { stopVoice(); return }
    const rec = new R(); rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; rec.interimResults = false
    const textMode = indexRef.current > 4
    rec.onstart = () => { setListening(true); setVoiceMsg(t.listening) }
    rec.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript
      if (textMode) { setFreeText(p => `${p} ${text}`.trim().slice(0, 1000)); setVoiceMsg(t.heard); return }
      const v = parseSpoken(text)
      if (v < 0) setVoiceMsg(t.notCaught); else { setVoiceMsg(`${t.heard}: “${text}”`); choose(v) }
    }
    rec.onerror = (e: any) => { setListening(false); recRef.current = null; setVoiceMsg(e.error === 'not-allowed' ? t.micDenied : t.notCaught) }
    rec.onend = () => { setListening(false); recRef.current = null }
    recRef.current = rec
    try { rec.start() } catch { recRef.current = null }
  }
  const copyNumber = (n: string) => { navigator.clipboard?.writeText(n).then(() => showToast(`${t.copied}: ${n}`)).catch(() => showToast(n)) }

  // hero parallax (direct style writes: no re-render per mouse move)
  const parallax = (e: RPointerEvent<HTMLDivElement>) => { const el = e.currentTarget, r = el.getBoundingClientRect(); el.style.setProperty('--mx', String(((e.clientX - r.left) / r.width) * 2 - 1)); el.style.setProperty('--my', String(((e.clientY - r.top) / r.height) * 2 - 1)) }
  const unparallax = (e: RPointerEvent<HTMLDivElement>) => { e.currentTarget.style.setProperty('--mx', '0'); e.currentTarget.style.setProperty('--my', '0') }
  const orbClick = (e: React.MouseEvent) => { burst(e.clientX, e.clientY, 14); setOrbPop(n => n + 1); setAffirmIdx(n => n + 1) }

  // language: reload the backend questions, keep everything else
  useEffect(() => {
    document.documentElement.lang = lang; setQuestions(QUESTIONS[lang]); setOptions(OPTIONS[lang])
    let live = true
    fetch(`/api/questions?lang=${lang}`).then(r => (r.ok ? r.json() : null)).then(d => { if (live && d && d.questions?.length === 5 && d.options?.length === 4) { setQuestions(d.questions); setOptions(d.options) } }).catch(() => {})
    return () => { live = false }
  }, [lang])

  // rotating loading lines
  useEffect(() => { if (!loading) return; const id = setInterval(() => setLoadMsg(n => n + 1), 900); return () => clearInterval(id) }, [loading])

  // global: ripple on every button, cursor glow, magnetic primary buttons
  useEffect(() => {
    const fine = window.matchMedia('(pointer:fine)').matches
    let magnet: HTMLElement | null = null
    const down = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.('button,.tele-button') as HTMLButtonElement | null
      if (!el || el.disabled) return
      const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement('span')
      s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`
      el.appendChild(s); setTimeout(() => s.remove(), 700)
    }
    const move = (e: PointerEvent) => {
      if (!fine) return
      const g = glowRef.current; if (g) { g.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`; g.classList.add('on') }
      const m = (e.target as HTMLElement)?.closest?.('.primary-action,.mic-button') as HTMLElement | null
      if (magnet && magnet !== m) { magnet.style.removeProperty('--tx'); magnet.style.removeProperty('--ty') }
      if (m) { const r = m.getBoundingClientRect(); m.style.setProperty('--tx', `${(e.clientX - r.left - r.width / 2) * 0.12}px`); m.style.setProperty('--ty', `${(e.clientY - r.top - r.height / 2) * 0.2}px`) }
      magnet = m
    }
    window.addEventListener('pointerdown', down); window.addEventListener('pointermove', move)
    return () => { window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move) }
  }, [])

  // keyboard: Esc closes sheets, 1-4 / A-D answer, arrows move between questions
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setAbout(false); setBreathe(false); return }
      if (screen !== 'checkin' || loading || about || breathe || (e.target as HTMLElement)?.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey) return
      if (index < 5) { const k = /^[1-4]$/.test(e.key) ? Number(e.key) - 1 : e.key.length === 1 ? 'abcd'.indexOf(e.key.toLowerCase()) : -1; if (k >= 0) choose(k) }
      if (e.key === 'ArrowLeft' && index > 0) goTo(index - 1)
      if (e.key === 'ArrowRight' && index < 5 && answers[index] !== undefined) goTo(index + 1)
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })

  const question = questions[index]
  const affirm = t.affirm[affirmIdx % t.affirm.length]
  const navOn = screen === 'insights' ? 'insights' : 'home'

  return <main className={`mello-app ${screen} tier-${result?.tier ?? 'none'}`}>
    <div className="glow" ref={glowRef} aria-hidden />
    <header className="topbar">
      <button className="brand-button" onClick={goHome} aria-label="Mello"><Logo /></button>
      <nav>
        <button className={navOn === 'home' ? 'on' : ''} onClick={goHome}>{t.home}</button>
        <button className={navOn === 'insights' ? 'on' : ''} onClick={showInsights}>{t.navInsights}</button>
        <button onClick={() => setBreathe(true)}>{t.breathe}</button>
      </nav>
      <div className="lang-switch" role="group" aria-label="Language">
        <button className={lang === 'hi' ? 'active' : ''} onClick={() => setLang('hi')}>हिन्दी</button>
        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>
    </header>

    {screen === 'home' && <section className="home-view enter">
      <div className="home-copy">
        <p className="eyebrow rise"><span className="eyebrow-dot" />{t.eyebrow}</p>
        <h1 key={lang}>{t.hero.split(' ').map((w, i) => <span className="word" style={delay(150 + i * 120)} key={i}>{w}</span>)}</h1>
        <p className="hero-sub rise" style={delay(550)}>{t.sub}</p>
        <div className="hero-actions rise" style={delay(700)}>
          <button className="primary-action" onClick={start}>{t.start}<ArrowRight /></button>
          <button className="text-action" onClick={showInsights}>{t.explore}<ArrowRight /></button>
        </div>
        <button className="privacy-note rise" style={delay(850)} onClick={() => setAbout(true)}><span><Heart /></span><div><strong>{t.privacy}</strong><small>{t.privacySub}</small></div></button>
      </div>
      <div className="hero-art" onPointerMove={parallax} onPointerLeave={unparallax}>
        <div className="sun-disc layer" style={{ ['--d' as any]: 10 }} />
        <div className="orb-orbit orbit-one layer" style={{ ['--d' as any]: 16 }} /><div className="orb-orbit orbit-two layer" style={{ ['--d' as any]: 16 }} />
        <div className="layer" style={{ ['--d' as any]: 26, display: 'grid', placeItems: 'center', zIndex: 1 }}>
          <button className={`orb ${orbPop ? (orbPop % 2 ? 'sqA' : 'sqB') : ''}`} onClick={orbClick} aria-label={affirm}><span className="orb-inner" /><span className="orb-glint" /></button>
        </div>
        <button className="art-caption layer" style={{ ['--d' as any]: 8 }} onClick={() => setAffirmIdx(n => n + 1)}><Waves /><span className="swap" key={affirmIdx}>{affirm}</span></button>
        <button className={`floating-chip chip-one layer ${speaking ? 'speaking' : ''}`} style={{ ['--d' as any]: 34 }} onClick={() => speak(affirm)}><Volume2 />{t.chipListen}</button>
        <button className="floating-chip chip-two layer" style={{ ['--d' as any]: 30 }} onClick={() => setBreathe(true)}><Wind />{t.chipBreathe}</button>
      </div>
    </section>}

    {screen === 'checkin' && <section className="checkin-view enter">
      <div className="checkin-head">
        <button className="back-button" onClick={back}><ChevronLeft /> {t.back}</button>
        <div className="progress-copy">{index < 5 ? <>{t.question} {index + 1} <span>/ 5</span></> : t.almost}</div>
        <div className="progress-track"><div style={{ width: `${Math.min(index + 1, 5) / 5 * 100}%` }} /></div>
        <div className="steps">{[0, 1, 2, 3, 4, 5].map(i => <button key={i} disabled={i > reached || loading} onClick={() => goTo(i)} aria-label={i < 5 ? `${t.question} ${i + 1}` : t.freeTitle} className={`step ${i === index ? 'cur' : ''} ${i !== index && (answers[i] !== undefined || (i === 5 && reached >= 5)) ? 'done' : ''}`} />)}</div>
      </div>
      {loading ? <div className="loading-state"><div className="loading-orb"><Sparkles /></div><h2 key={loadMsg}>{t.loadMsgs[Math.min(loadMsg, t.loadMsgs.length - 1)]}</h2><div className="loading-dots"><i /><i /><i /></div></div>
        : <div className={`question-layout dir-${dir}`}>
          <div className="question-copy qanim" key={`c${index}`}>
            <p className="eyebrow"><span className="eyebrow-dot" />{index < 5 ? `${DOMAIN[lang][question?.domain] ?? 'Mello'} · 0${index + 1}` : 'Mello · 06'}</p>
            <h2>{index < 5 ? question?.text : t.freeTitle}</h2>
            <p className="question-hint">{index < 5 ? t.ready : t.freeHint}</p>
            {index < 5 && <button className={`listen-link ${speaking ? 'speaking' : ''}`} onClick={() => question && speak(question.text)}><Volume2 /> {t.listen}</button>}
          </div>
          <div className="voice-panel">
            <div className={`voice-orb ${listening ? 'is-listening' : ''}`}>
              <div className="voice-ring ring-a" /><div className="voice-ring ring-b" /><div className="voice-ring ring-c" />
              <button className="voice-core" onClick={listen} aria-label={t.speakBtn}><Mic /></button>
              {listening && <div className="waveform">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <i key={n} style={{ animationDelay: `${n * 70}ms` }} />)}</div>}
            </div>
            <button className={`mic-button ${listening ? 'active' : ''}`} onClick={listen}><Mic />{listening ? t.stopBtn : t.speakBtn}</button>
            {voiceMsg && <p className="voice-message" role="status" key={voiceMsg}>{voiceMsg}</p>}
          </div>
          {index < 5 ? <>
            <div className="answers qanim" key={`a${index}`}>
              <p>{t.tap}</p>
              {options.map((label, k) => <button key={k} style={delay(120 + k * 70)} className={`ans ${answers[index] === k ? 'selected' : ''}`} onClick={e => choose(k, e)}>{label}<span>{answers[index] === k ? <Check /> : String.fromCharCode(65 + k)}</span></button>)}
            </div>
            {reached > index && answers[index] !== undefined && <div className="next-row"><button className="primary-action" onClick={() => goTo(index + 1)}>{t.next}<ArrowRight /></button></div>}
          </> : <div className="freebox">
            <textarea value={freeText} maxLength={1000} placeholder={t.freePh} onChange={e => setFreeText(e.target.value)} aria-label={t.freeTitle} />
            <div className="free-actions">
              <span className="count">{freeText.length}/1000</span>
              <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {!freeText && <button className="text-action" onClick={submit}>{t.skip}</button>}
                <button className="primary-action" onClick={submit}>{t.seeResult}<ArrowRight /></button>
              </span>
            </div>
          </div>}
        </div>}
    </section>}

    {screen === 'result' && result && <ResultView result={result} t={t} lang={lang} burst={burst} onReset={() => go('home', resetState)} onCopy={copyNumber} />}
    {screen === 'insights' && <InsightsView data={insights} t={t} lang={lang} refreshing={refreshing} onRefresh={loadInsights} onBack={goHome} onStart={start} burst={burst} />}

    <footer><span>© Mello</span><button className="foot-link" onClick={() => setAbout(true)}><ShieldCheck />{t.disclaimer}</button></footer>

    <nav className="dock" aria-label="Main">
      <button className={navOn === 'home' ? 'on' : ''} onClick={goHome}><Heart />{t.home}</button>
      <button className={navOn === 'insights' ? 'on' : ''} onClick={showInsights}><Waves />{t.navInsights}</button>
      <button onClick={() => setBreathe(true)}><Wind />{t.breathe}</button>
    </nav>

    {about && <Sheet title={t.aboutTitle} onClose={() => setAbout(false)} closeLabel={t.close}><ul>{t.about.map((line, i) => <li key={i} style={delay(100 + i * 90)}>{i === 2 ? <Phone /> : i === 1 ? <ShieldCheck /> : <Info />}<span>{line}</span></li>)}</ul></Sheet>}
    {breathe && <BreatheGuide t={t} onClose={() => setBreathe(false)} />}
    <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    <div className="fx" aria-hidden>{bursts.map(b => b.items.map((p, i) => <i key={`${b.id}-${i}`} className={`petal c${p.c}`} style={{ left: b.x, top: b.y, ['--dx' as any]: `${p.dx}px`, ['--dy' as any]: `${p.dy}px`, ['--r' as any]: `${p.r}deg`, ['--s' as any]: p.s }} />))}</div>
    <div className={`wipe ${wipe ? 'on' : ''}`} aria-hidden />
  </main>
}

function ResultView({ result, t, lang, burst, onReset, onCopy }: { result: Result; t: Copy; lang: Lang; burst: (x: number, y: number, n?: number) => void; onReset: () => void; onCopy: (n: string) => void }) {
  const [open, setOpen] = useState(false)
  const [tried, setTried] = useState<Record<number, boolean>>({})
  const on = useMounted()
  useEffect(() => {
    if (result.tier === 'red') return
    const id = setTimeout(() => burst(window.innerWidth * 0.3, window.innerHeight * 0.38, result.tier === 'green' ? 18 : 8), 600)
    return () => clearTimeout(id)
  }, [])
  const triedCount = Object.values(tried).filter(Boolean).length
  const toggleTip = (i: number, e: React.MouseEvent) => { const v = !tried[i]; setTried(s => ({ ...s, [i]: v })); if (v) burst(e.clientX, e.clientY, 8) }
  const sc = result.scores
  const meters: [string, number, number][] = sc ? [[t.meters.mood, sc.phq2, 6], [t.meters.worry, sc.gad2, 6], [t.meters.rest, sc.sleep, 3]] : []
  const call = (cls = '') => <div className="call-row"><a className={`tele-button ${cls}`} href="tel:14416"><Phone /> {t.tele} · 14416</a><button className="copy-chip" onClick={() => onCopy('14416')}><Copy />{t.copyNum}</button></div>
  return <section className="result-view enter">
    <div className="result-illustration">
      <div className="result-sun" /><div className="result-leaf leaf-a" /><div className="result-leaf leaf-b" />
      <button className="result-heart" aria-label="Mello" onClick={e => burst(e.clientX, e.clientY, 12)}>{result.tier === 'red' ? <Info /> : <Heart />}</button>
    </div>
    <div className="result-content">
      <div className={`tier-pill ${result.tier}`}><span />{t.tier[result.tier]}</div>
      {result.tier === 'red' && <div className="urgent-box"><strong>{t.emergency}</strong><a href="tel:112"><Phone /> 112</a>{call()}<small>1-800-891-4416</small></div>}
      <p className="eyebrow">Mello</p>
      <h1>{result.headline}</h1>
      <p className="result-body">{result.body}</p>
      {result.offline && <p className="offline-note">{t.offline}</p>}
      {meters.length > 0 && <div className="meters" aria-label={t.yourCheckin}>{meters.map(([label, v, max]) => <div className="meter" key={label}><span>{label}</span><div><i style={{ width: on ? `${(v / max) * 100}%` : 0 }} /></div><b>{v}/{max}</b></div>)}</div>}
      {result.tips.length > 0 && <>
        <div className="tips">{result.tips.map((tip, i) => <button key={tip.title} style={delay(300 + i * 120)} className={`tip ${tried[i] ? 'tried' : ''}`} onClick={e => toggleTip(i, e)} aria-pressed={!!tried[i]}><Sparkles /><div><strong>{tip.title}</strong><p>{tip.text}</p></div><span className="tick"><Check /></span></button>)}</div>
        <p className="tips-progress">{t.tried(triedCount, result.tips.length)}</p>
      </>}
      {result.tier === 'amber' && call('amber-call')}
      <button className="trace-toggle" onClick={() => setOpen(!open)} aria-expanded={open}><span><Info /> {t.agents}</span><ChevronDown className={open ? 'rotate' : ''} /></button>
      <div className={`collapse ${open ? 'open' : ''}`}><div><div className="trace-panel">{result.trace.length ? result.trace.map((row, i) => <div key={row.agent + i} style={delay(i * 70)}><strong>{row.agent}</strong><p>{row.detail}</p></div>) : <p>Mello {lang === 'hi' ? 'ने आपके जवाब देखे और यह सहायक उत्तर तैयार किया।' : 'reviewed your answers and prepared this gentle response.'}</p>}</div></div></div>
      <p className="disclaimer">{t.disclaimer}</p>
      <button className="primary-action restart" onClick={onReset}><RotateCcw /> {t.again}</button>
    </div>
  </section>
}

function InsightsView({ data, t, lang, refreshing, onRefresh, onBack, onStart, burst }: { data: any; t: Copy; lang: Lang; refreshing: boolean; onRefresh: () => void; onBack: () => void; onStart: () => void; burst: (x: number, y: number, n?: number) => void }) {
  const [pick, setPick] = useState<string | null>(null)
  const on = useMounted()
  const suppressed = data?.suppressed ?? true, total: number = data?.total ?? 0
  const tiers: Record<string, number> = data?.tier ?? {}, themes: Record<string, number> = data?.themes ?? {}
  const bars = (Object.entries(themes) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = Math.max(1, ...bars.map(b => b[1]))
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)
  const note = !pick ? t.tapBar : pick.startsWith('t:') ? `${t.tierName[pick.slice(2) as Tier]}: ${t.ofTotal(tiers[pick.slice(2)] ?? 0, total, pct(tiers[pick.slice(2)] ?? 0))}` : `${THEME[lang][pick] ?? pick}: ${t.ofTotal(themes[pick] ?? 0, total, pct(themes[pick] ?? 0))}`
  const tierRow = (k: Tier) => <button key={k} className={`tier-row ${pick === `t:${k}` ? 'on' : ''}`} onClick={() => setPick(pick === `t:${k}` ? null : `t:${k}`)} disabled={suppressed}><i className={`${k}-dot`} />{t.tierName[k]}<b>{suppressed ? '—' : tiers[k] ?? '—'}</b></button>
  return <section className="insights-view enter">
    <button className="back-button" onClick={onBack}><ChevronLeft /> {t.home}</button>
    <div className="insights-heading">
      <p className="eyebrow rise"><span className="eyebrow-dot" />Mello community</p>
      <h1 className="rise" style={delay(80)}>{t.insightsTitle}</h1>
      <p className="rise" style={delay(160)}>{t.insightsSub}</p>
      <div className="insights-actions rise" style={delay(240)}>
        <button className={`ghost-btn ${refreshing ? 'spinning' : ''}`} onClick={onRefresh}><RefreshCw />{t.refresh}</button>
        <button className="primary-action" onClick={onStart}>{t.tryCheckin}<ArrowRight /></button>
      </div>
    </div>
    <div className="insights-stats">
      <div className="big-stat"><span>{t.total}</span><strong>{suppressed ? '—' : <CountUp to={total} />}</strong><small>{suppressed ? t.notEnough : t.allTime}</small></div>
      <div className="tier-stats">{(['green', 'amber', 'red'] as Tier[]).map(tierRow)}</div>
    </div>
    {suppressed
      ? <div className="insights-empty"><button className="empty-orb" aria-label="Mello" onClick={e => burst(e.clientX, e.clientY, 10)}><Heart /></button><h2>{t.notEnough}</h2><p>{t.privacyInsights}</p></div>
      : <div className="theme-chart"><h2>{t.themes}</h2>
        {bars.map(([key, value]) => <button className={`bar-row ${pick === key ? 'on' : ''}`} key={key} onClick={() => setPick(pick === key ? null : key)}><span>{THEME[lang][key] ?? key}</span><div><i style={{ width: on ? `${(value / max) * 100}%` : 0 }} /></div><b>{value}</b></button>)}
        <p className="insight-note" key={pick ?? 'hint'}>{note}</p></div>}
  </section>
}
