import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, CalendarDays, Check, ChevronDown, Clock3, Heart, MapPin, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { wedding, mapLinks } from './data';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_PROJECT') ? createClient(supabaseUrl, supabaseKey) : null;
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.22, 1, 0.36, 1] } } };

function SectionHeading({ eyebrow, title, children }) {
  return <motion.div className="section-heading" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: .35 }}>
    <span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}
  </motion.div>;
}
function Envelope({ opened, onClick }) {
  return <button className={`envelope-button ${opened ? 'is-open' : ''}`} onClick={onClick} aria-label={opened ? '편지 봉투 닫기' : '편지 봉투 열기'} aria-expanded={opened}>
    <span className="envelope-shadow"/><span className="letter-sheet"><span className="letter-flourish">A little note</span><span className="letter-copy">{wedding.letter}</span><span className="letter-rule"/><span className="letter-sign">MINYOUNG & YERIN</span></span>
    <span className="envelope-body"/><span className="envelope-flap"/><span className="envelope-seal">M <i>·</i> Y</span>
  </button>;
}
function RSVPModal({ onClose }) {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState('yes');
  const [companions, setCompanions] = useState('0');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const configured = Boolean(supabase);
  useEffect(() => { const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; const esc = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', esc); return () => { document.body.style.overflow = old; window.removeEventListener('keydown', esc); }; }, [onClose]);
  async function submit(e) {
    e.preventDefault(); if (status === 'sending') return;
    if (!configured) { setError('아직 RSVP 데이터베이스 연결이 완료되지 않았어요. 입력 내용은 보존되며, 주최자가 Supabase 설정을 마치면 제출할 수 있어요.'); return; }
    if (!consent) { setError('개인정보 수집·이용에 동의해 주세요.'); return; }
    setStatus('sending'); setError('');
    try {
      const { error: insertError } = await supabase.from('rsvps').insert({ name: name.trim(), attendance, companions: attendance === 'yes' ? Number(companions) : 0, message: message.trim() || null, privacy_consent: consent, privacy_notice_version: '2026-10-26-v1' });
      if (insertError) throw insertError;
      setStatus('success'); setComplete(true);
    } catch (err) { setStatus('error'); setError('응답을 저장하지 못했어요. 입력 내용은 그대로 남아 있어요. 네트워크를 확인한 뒤 다시 시도해 주세요.'); console.error('RSVP submit failed', err); }
  }
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <motion.div className="rsvp-modal" role="dialog" aria-modal="true" aria-labelledby="rsvp-title" initial={{ opacity: 0, y: 22, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
      <button className="icon-button modal-close" onClick={onClose} aria-label="창 닫기"><X size={19}/></button>
      {complete ? <div className="success-state"><svg className="confetti" viewBox="0 0 180 110" aria-hidden="true"><path d="M32 24l8 12-12 2zM143 16l5 13-13-3zM90 6l7 10-9 5zM154 74l-12 7 1-13zM40 82l-8 9-4-13z" fill="#b49a6c"/><circle cx="64" cy="20" r="3" fill="#642d38"/><circle cx="119" cy="91" r="4" fill="#642d38"/><path d="M82 48c-12-15-30 3 0 23 30-20 12-38 0-23z" fill="none" stroke="#642d38" strokeWidth="1.4"/></svg><span className="eyebrow">THANK YOU</span><h2 id="rsvp-title">응답이 전달되었어요</h2><p>소중한 마음 전해주셔서 감사합니다.</p><button className="primary-button" onClick={onClose}>닫기</button></div> : <>
        <span className="eyebrow">RÉPONSE, S'IL VOUS PLAÎT</span><h2 id="rsvp-title">참석 여부를 알려주세요</h2><p className="modal-intro">보내주신 응답은 예식 준비를 위해서만 사용됩니다.</p>
        {!configured && <div className="config-warning">관리자 설정 전 미리보기 상태예요. 실제 저장은 Supabase 연결 후 활성화됩니다.</div>}
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="guest-name">성함 <span>*</span></label><input id="guest-name" autoFocus required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="이름을 입력해 주세요" />
          <fieldset><legend className="field-label">참석 여부 <span>*</span></legend><div className="choice-row"><label className={attendance === 'yes' ? 'choice selected' : 'choice'}><input type="radio" name="attendance" value="yes" checked={attendance === 'yes'} onChange={() => setAttendance('yes')}/>참석할게요</label><label className={attendance === 'no' ? 'choice selected' : 'choice'}><input type="radio" name="attendance" value="no" checked={attendance === 'no'} onChange={() => setAttendance('no')}/>참석이 어려워요</label></div></fieldset>
          {attendance === 'yes' && <><label className="field-label" htmlFor="companions">동반 인원 <span className="muted">본인 제외</span></label><select id="companions" value={companions} onChange={e => setCompanions(e.target.value)}>{[0,1,2,3,4,5].map(n => <option value={n} key={n}>{n}명</option>)}</select></>}
          <label className="field-label" htmlFor="guest-message">전달 메시지 <span className="muted">선택</span></label><textarea id="guest-message" rows="3" maxLength={500} value={message} onChange={e => setMessage(e.target.value)} placeholder="전하고 싶은 말이 있다면 남겨주세요." />
          <div className="privacy-box"><p><strong>개인정보 수집·이용 안내</strong></p><p>목적: {wedding.privacy.purpose}</p><p>항목: {wedding.privacy.items}</p><p>보관 기간: {wedding.privacy.retention}</p><label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required/><span>{wedding.privacy.consentText}</span></label></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button full-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? '전송 중…' : '응답 보내기'} <ArrowUpRight size={16}/></button>
          <p className="form-footnote">동의하지 않으시면 응답을 제출할 수 없습니다.</p>
        </form>
      </>}
    </motion.div>
  </motion.div>;
}
function App() {
  const [letterOpen, setLetterOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [adminBusy, setAdminBusy] = useState(false);
  useEffect(() => { if (!supabase) return; supabase.auth.getSession().then(({ data }) => { if (data.session) { setAdminUser(data.session.user); loadRsvps(); } }); }, []);
  async function loadRsvps() { if (!supabase) return; setAdminBusy(true); const { data, error } = await supabase.from('rsvps').select('id,name,attendance,companions,message,created_at').order('created_at', { ascending: false }); setAdminBusy(false); if (error) setAdminStatus('관리자 권한이 없거나 응답을 불러오지 못했어요. admin_users 설정과 RLS 정책을 확인해 주세요.'); else { setRsvps(data || []); setAdminStatus(''); } }
  async function adminLogin(e) { e.preventDefault(); if (!supabase) { setAdminStatus('먼저 .env.local에 Supabase URL과 공개 키를 설정해 주세요.'); return; } setAdminBusy(true); const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword }); setAdminBusy(false); if (error) setAdminStatus('로그인에 실패했어요. 계정 정보와 Supabase 설정을 확인해 주세요.'); else { setAdminUser(data.user); setAdminStatus(''); loadRsvps(); } }
  async function deleteRsvp(id) { if (!window.confirm('이 응답을 영구 삭제할까요?')) return; const { error } = await supabase.from('rsvps').delete().eq('id', id); if (error) setAdminStatus('삭제하지 못했어요. 관리자 권한을 확인해 주세요.'); else { setRsvps(prev => prev.filter(row => row.id !== id)); setAdminStatus('응답을 삭제했어요.'); } }
  async function adminLogout() { await supabase.auth.signOut(); setAdminUser(null); setRsvps([]); }
  function exportCsv() { const headers = ['이름','참석 여부','동반 인원','메시지','응답 일시']; const rows = rsvps.map(r => [r.name, r.attendance === 'yes' ? '참석' : '불참', r.companions, r.message || '', new Date(r.created_at).toLocaleString('ko-KR')]); const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\r\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'wedding-rsvp.csv'; a.click(); URL.revokeObjectURL(url); }
  async function copyAddress() { try { await navigator.clipboard.writeText(wedding.address); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }
  const names = `${wedding.groom}  ·  ${wedding.bride}`;
  return <main className="site-shell">
    <div className="topline"><span>AN INVITATION</span><span>04 / 04 / 2027</span></div>
    <section className="hero" id="opening">
      <div className="hero-ornament ornament-left" aria-hidden="true"><svg viewBox="0 0 80 180"><path d="M42 175C28 130 62 97 36 57 24 38 32 19 47 5M39 108c-19-2-27-16-24-29 17 2 25 13 24 29ZM39 140c19-4 29-18 27-31-17 4-27 16-27 31Z" fill="none" stroke="currentColor" strokeWidth="1"/></svg></div>
      <motion.div className="hero-content" initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}>
        <span className="eyebrow hero-eyebrow">SAVE THE DATE</span><div className="tiny-star" aria-hidden="true">✳</div><p className="hero-date">{wedding.date}</p><p className="hero-weekday">{wedding.weekday} · {wedding.time}</p>
        <div className="hero-rule"><span/><i>✦</i><span/></div><h1>{wedding.groom}<span>and</span>{wedding.bride}</h1><p className="hero-subtitle">저희 결혼합니다</p>
        <div className="hero-venue"><MapPin size={13} strokeWidth={1.5}/><span>{wedding.venue}</span></div>
      </motion.div>
      <div className="hero-bottom"><span>ONE DAY, TWO HEARTS</span><a href="#letter" aria-label="다음 섹션으로 이동"><ArrowDown size={16}/></a><span>SEOUL · KOREA</span></div>
    </section>
    <section className="letter-section section-pad" id="letter"><SectionHeading eyebrow="A LETTER FOR YOU" title="A little note, from us" >마음을 담아 작은 편지를 준비했어요.</SectionHeading><div className="envelope-wrap"><Envelope opened={letterOpen} onClick={() => setLetterOpen(v => !v)}/></div><p className="tap-hint">{letterOpen ? '편지를 다시 봉투에 넣어보세요' : '봉투를 눌러 편지를 열어보세요'} <ChevronDown size={13}/></p></section>
    <section className="memories-section section-pad"><SectionHeading eyebrow="NOTES FROM OUR PEOPLE" title="Little moments, kept close">우리의 순간들을 작은 사진 속에 담았어요.</SectionHeading><div className="polaroid-stage">{wedding.memories.map((photo, i) => <motion.button key={photo.image} className={`polaroid polaroid-${i + 1}`} onClick={() => setActivePhoto(photo)} whileHover={{ y: -7, rotate: 0, scale: 1.02 }} whileTap={{ scale: .98 }} aria-label={`${i + 1}번째 사진 확대`}><span className="photo-frame"><img src={photo.image} alt={photo.alt} onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.classList.add('missing-photo'); }}/><span className="missing-photo-label">PHOTO<br/>TO BE ADDED</span></span><span className="polaroid-paper"/></motion.button>)}</div><p className="photo-note">A collection of days we want to remember.</p></section>
    <section className="party-section section-pad"><SectionHeading eyebrow="THE PARTY" title="A day to celebrate">기쁜 날, 함께 웃으며 축복해 주세요.</SectionHeading><div className="ticket"><div className="ticket-top"><span>WEDDING INVITATION</span><span>NO. 0404</span></div><div className="ticket-center"><span className="ticket-date">{wedding.date}</span><span className="ticket-weekday">{wedding.weekday}</span><span className="ticket-time"><Clock3 size={14}/>{wedding.time}</span></div><div className="ticket-perforation"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div><div className="ticket-bottom"><div><span className="ticket-label">VENUE</span><strong>{wedding.venue}</strong><span>{wedding.address}</span></div><div className="ticket-dress"><span className="ticket-label">DRESS CODE</span><strong>{wedding.dressCode}</strong></div></div><span className="ticket-stamp">M <i>·</i> Y</span></div></section>
    <section className="location-section section-pad"><SectionHeading eyebrow="COME FIND US" title="We'll be waiting for you">오시는 길을 확인해 주세요.</SectionHeading><div className="map-paper"><div className="map-header"><span>LOCATION GUIDE</span><span>SEOUL, KR</span></div><div className="map-art"><img src={wedding.mapImage} alt="라루체 웨딩홀 약도" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.classList.add('missing-map'); }}/><div className="map-placeholder"><MapPin size={24}/><strong>약도 이미지가 필요해요</strong><span>첨부 약도를 public/images/map.png로 추가해 주세요.</span></div></div><div className="map-details"><h3>{wedding.venue}</h3><p>{wedding.address}</p><button className="copy-address" onClick={copyAddress}>{copied ? <Check size={14}/> : <span className="copy-symbol">↗</span>}{copied ? '주소 복사 완료' : '주소 복사하기'}</button></div><div className="map-buttons"><a href={mapLinks.naver} target="_blank" rel="noreferrer"><span className="map-brand naver">N</span>NAVER MAP<ArrowUpRight size={14}/></a><a href={mapLinks.kakao} target="_blank" rel="noreferrer"><span className="map-brand kakao">K</span>KAKAO MAP<ArrowUpRight size={14}/></a><a href={mapLinks.tmap} target="_blank" rel="noreferrer"><span className="map-brand tmap">T</span>TMAP<ArrowUpRight size={14}/></a></div><p className="map-link-note">네이버 지도와 카카오맵은 해당 주소 검색으로 연결됩니다. 티맵은 현재 공식 홈페이지로 연결되며, 장소 지정 링크는 검증되지 않아 최종 배포 전 확인이 필요합니다.</p></div></section>
    <section className="rsvp-section section-pad"><SectionHeading eyebrow="RÉPONSE, S'IL VOUS PLAÎT" title="Kindly reply">참석 여부를 알려주시면 예식 준비에 큰 도움이 됩니다.</SectionHeading><button className="rsvp-button" onClick={() => setRsvpOpen(true)}><span>RSVP</span><span>참석 여부 전달하기</span><ArrowUpRight size={17}/></button><p className="rsvp-small">Your presence is the loveliest gift.</p></section>
    <footer className="ending-section"><div className="ending-flower" aria-hidden="true"><svg viewBox="0 0 120 120"><g fill="none" stroke="currentColor" strokeWidth=".8"><ellipse cx="60" cy="36" rx="10" ry="23"/><ellipse cx="60" cy="84" rx="10" ry="23"/><ellipse cx="36" cy="60" rx="23" ry="10"/><ellipse cx="84" cy="60" rx="23" ry="10"/><ellipse cx="43" cy="43" rx="10" ry="23" transform="rotate(-45 43 43)"/><ellipse cx="77" cy="77" rx="10" ry="23" transform="rotate(-45 77 77)"/><ellipse cx="77" cy="43" rx="10" ry="23" transform="rotate(45 77 43)"/><ellipse cx="43" cy="77" rx="10" ry="23" transform="rotate(45 43 77)"/><circle cx="60" cy="60" r="8"/></g></svg></div><span className="eyebrow">WITH LOVE AND GRATITUDE</span><h2>{wedding.ending}</h2><p>바쁜 걸음 해주시어 함께 축하해 주신다면<br/>더없는 기쁨으로 간직하겠습니다.</p><div className="ending-names">{names}</div><span className="ending-date">{wedding.date} · {wedding.time}</span><div className="footer-line"/><button className="admin-trigger" onClick={() => setAdminOpen(v => !v)}>{adminOpen ? '관리자 닫기' : '관리자'}</button>
      <AnimatePresence>{adminOpen && <motion.div className="admin-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><div className="admin-inner"><span className="eyebrow">HOST ACCESS</span><h3>응답 관리</h3>{!adminUser ? <form onSubmit={adminLogin}><input type="email" required placeholder="관리자 이메일" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}/><input type="password" required placeholder="비밀번호" value={adminPassword} onChange={e => setAdminPassword(e.target.value)}/><button className="primary-button" disabled={adminBusy}>{adminBusy ? '확인 중…' : '로그인'}</button></form> : <><div className="admin-actions"><span>{adminUser.email}</span><button onClick={loadRsvps}>새로고침</button><button onClick={exportCsv}>CSV 내보내기</button><button onClick={adminLogout}>로그아웃</button></div>{adminBusy ? <p>응답을 불러오는 중…</p> : <div className="rsvp-list">{rsvps.length ? rsvps.map(r => <div className="rsvp-row" key={r.id}><div><strong>{r.name}</strong><span>{r.attendance === 'yes' ? `참석 · 동반 ${r.companions}명` : '불참'}</span>{r.message && <p>{r.message}</p>}<small>{new Date(r.created_at).toLocaleString('ko-KR')}</small></div><button onClick={() => deleteRsvp(r.id)} aria-label={`${r.name} 응답 삭제`}>삭제</button></div>) : <p>아직 응답이 없어요.</p>}</div>}</>}{adminStatus && <p className="admin-status" role="status">{adminStatus}</p>}</div></motion.div>}</AnimatePresence>
    </footer>
    <p className="site-credit">MADE WITH CARE · MINYOUNG & YERIN</p>
    <AnimatePresence>{activePhoto && <motion.div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="사진 확대 보기" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActivePhoto(null)}><button className="icon-button lightbox-close" onClick={() => setActivePhoto(null)} aria-label="사진 닫기"><X/></button><motion.div className="lightbox-content" initial={{ scale: .9, y: 14 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}><div className="lightbox-photo"><img src={activePhoto.image} alt={activePhoto.alt} onError={e => { e.currentTarget.style.display = 'none'; }}/></div><div className="sticky-note">{activePhoto.note}</div></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{rsvpOpen && <RSVPModal onClose={() => setRsvpOpen(false)}/>}</AnimatePresence>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
