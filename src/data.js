// Edit wedding details, copy, photo paths, and privacy notice here.
export const wedding = {
  groom: '최민영',
  bride: '소예린',
  date: '2027. 04. 04',
  weekday: 'SUNDAY',
  time: '12:00 PM',
  timeKo: '낮 12시',
  venue: '라루체 아이리스홀',
  address: '서울 중구 퇴계로18길 46 라루체 웨딩홀',
  dressCode: '자유롭게',
  letter: '저희의 새로운 시작을 함께해주세요',
  ending: '감사합니다',
  memories: [
    { image: '/images/photo-1.jpg', alt: '첫 번째 추억 사진', note: '첫 번째 메모' },
    { image: '/images/photo-2.jpg', alt: '두 번째 추억 사진', note: '두 번째 메모' },
    { image: '/images/photo-3.jpg', alt: '세 번째 추억 사진', note: '세 번째 메모' },
  ],
  mapImage: '/images/map.png',
  privacy: {
    purpose: '결혼식 참석 여부 확인 및 예식 준비',
    items: '이름, 참석 여부, 동반 인원, 전달 메시지',
    retention: '예식일로부터 30일 후 삭제',
    consentText: '개인정보 수집·이용 안내를 확인했으며 이에 동의합니다.',
  },
};

export const mapLinks = {
  naver: 'https://map.naver.com/p/search/' + encodeURIComponent('서울 중구 퇴계로18길 46 라루체 웨딩홀'),
  kakao: 'https://map.kakao.com/?q=' + encodeURIComponent('서울 중구 퇴계로18길 46 라루체 웨딩홀'),
  // TMAP's destination-search deep link can behave differently by OS/app version.
  // Keep a verified official TMAP destination page until a location-specific deep link is confirmed.
  tmap: 'https://www.tmap.co.kr/',
};
