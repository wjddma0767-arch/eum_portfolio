if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger);

// 1. 섹션 1 애니메이션
const tlHero = gsap.timeline();
tlHero.from(".main-title, .sub-title", { y: 100, opacity: 0, duration: 1, ease: "power4.out" })
      .from(".png-obj", { y: -500, opacity: 0, stagger: 0.2, duration: 1.2, ease: "bounce.out" }, "-=0.5");

// 2. 섹션 2 가로 스크롤 및 돔(Dome) 아크 실시간 변환 연산 (관성 복원 정렬 탑재)
const cards = gsap.utils.toArray(".card-item");
let lastIdx = -1;

// 카드의 돔형 원형 배치 및 크기/기울기를 정밀하게 계산하는 물리 함수
function updateCardTransforms() {
    const viewportCenterX = window.innerWidth / 2;
    
    // 모션 아크 포물선의 급격함을 제어하는 거리 계수
    const maxDistance = window.innerWidth > 768 ? window.innerWidth * 0.45 : window.innerWidth * 0.65;
    
    let closestCardIdx = 0;
    let minDistance = Infinity;

    cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const distanceFromCenter = cardCenterX - viewportCenterX;
        const absDistance = Math.abs(distanceFromCenter);
        
        // 현재 실제로 화면 중앙에 가장 밀착한 카드를 역추적 (active 정합성 확보)
        if (absDistance < minDistance) {
            minDistance = absDistance;
            closestCardIdx = i;
        }

        let ratio = distanceFromCenter / maxDistance;
        ratio = Math.max(-1.3, Math.min(1.3, ratio)); // 한계 외곽 고정
        const absRatio = Math.abs(ratio);
        
        // [A] 포물선 디핑 연산: 위아래 화면 공간의 안정을 위해 최대 하강폭을 미세 조정합니다 (140 -> 110)
        // 화면 하단 경계를 넘지 않으면서도 수려한 라운드 궤적을 뚜렷하게 보존해 줍니다.
        const targetY = Math.pow(absRatio, 1.8) * 110;
        
        // [B] 구체형 Z회전 연산: 카드가 구 위에 얹힌 듯 바깥 방향으로 회전 기우뚱 (최대 25도 회전)
        const targetRotation = ratio * 25; 
        
        // [C] 극적인 크기 변화 (Scale 수치 미세 보정):
        // 세로 공간 부족을 해결하기 위해 센터 카드의 스케일을 1.18로 낮추고, 사이드 카드는 원근감(0.7배)이 유지되도록 비율을 맞춥니다.
        const targetScale = 1.18 - Math.pow(absRatio, 1.5) * 0.48;
        
        // [D] 가장자리 이탈 시 불투명도 지수 감쇄 (Alpha Fading)
        const targetOpacity = 1.0 - Math.pow(absRatio, 1.5) * 0.85;
        
        // [E] 실시간 입체 스태킹 (z-index)
        const calculatedZIndex = Math.round((1 - Math.min(1, absRatio)) * 20);
        card.style.zIndex = calculatedZIndex;
        
        // 지연 없는 실시간 하드웨어 가속 적용
        gsap.set(card.querySelector('.card-inner'), {
            y: targetY,
            rotation: targetRotation,
            scale: targetScale,
            opacity: targetOpacity
        });
    });

    // 뷰포트 중심 추적 결과를 토대로 최적 시점에 활성화 클래스 토글
    if (closestCardIdx !== lastIdx) {
        lastIdx = closestCardIdx;
        cards.forEach((card, i) => {
            if (i === closestCardIdx) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }
        });
    }
}

// 스크롤 트윈 제어
gsap.to(".cards-container", {
    x: () => {
        const card1 = cards[0];
        const card2 = cards[1];
        if (card1 && card2) {
            // 브라우저 렌더링 엔진 오차 극복을 위해 DOM 오프셋 간격을 픽셀 단위로 직접 추출하여 완벽 계산
            const actualOffset = card2.offsetLeft - card1.offsetLeft;
            return -actualOffset * (cards.length - 1);
        }
        return 0;
    },
    ease: "none",
    scrollTrigger: {
        trigger: ".section-horizontal",
        pin: true,
        scrub: 1,
        start: "top top",
        // [수정] 스크롤 범위 증가: 마지막 카드까지 완전히 전환되도록 end 값 조정
        end: "+=3500", 
        invalidateOnRefresh: true
    },
    // 스크롤 트윈 자체의 onUpdate 프레임 이벤트로 연동하여, scrub 관성이 굴러가는 모든 시간 동안 카드 회전/복원을 완벽히 갱신합니다.
    onUpdate: updateCardTransforms 
});

// 초기 로드 시 대기 상태에서도 1번 카드는 대형화, 2/3번 카드는 아크 정렬 배치되도록 강제 호출
updateCardTransforms();

// 윈도우 크기 변경 시 및 스크롤 리프레시 시 정밀 궤적 보정 리셋 이벤트 연동
window.addEventListener("resize", updateCardTransforms);
ScrollTrigger.addEventListener("refresh", updateCardTransforms);
// 3. 섹션 3: 2초 순환 스택 박스
const stacks = document.querySelectorAll(".stack-box");
let currentStack = 0;

function rotateStacks() {
    stacks.forEach(box => box.classList.remove("active", "peek"));
    
    stacks[currentStack].classList.add("active");
    
    let next = (currentStack + 1) % stacks.length;
    stacks[next].classList.add("peek");
    
    currentStack = (currentStack + 1) % stacks.length;
}
setInterval(rotateStacks, 3000);
rotateStacks();

// 4. 스크롤 리빌 애니메이션 (Works 섹션 등)
const reveals = document.querySelectorAll(".reveal");
reveals.forEach(el => {
    ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        onEnter: () => el.classList.add("active")
    });
});

// 5. 푸터 타이핑 및 이메일 강조 (트리거 시점 및 딜레이 완화)
const typingText = "좋아하면 더 잘한다는 마음으로, 오늘도 즐겁게 일하겠습니다!";
const target = document.getElementById("typing-text");
let charIdx = 0;

function typeWriter() {
    if (charIdx < typingText.length) {
        target.innerHTML += typingText.charAt(charIdx);
        charIdx++;
        setTimeout(typeWriter, 100);
    }
}

ScrollTrigger.create({
    trigger: ".footer",
    start: "top 85%", // 푸터가 화면 하단에 15% 정도 살짝 걸치자마자 바로 실행되도록 조율
    onEnter: () => {
        typeWriter();
        // 타이핑 시간을 고려하여 이메일이 드러나는 딜레이를 기존 2초에서 1.2초로 줄였습니다.
        gsap.from(".email-link", { scale: 0, opacity: 0, duration: 1, delay: 1.2, ease: "back.out(1.7)" });
    },
    once: true
});


// [수정] 6. 모달(팝업) 열기 및 닫기 제어 (Fetch 자동 연동형)
document.addEventListener('DOMContentLoaded', () => {
    const moreButtons = document.querySelectorAll('.btn-more');
    const closeButtons = document.querySelectorAll('.modal-close');
    const overlays = document.querySelectorAll('.modal-overlay');

    // 상세 보기 버튼 클릭 시 모달 열기
    moreButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetModal = document.getElementById(targetId);
            
            if (targetModal) {
                // 모달 엘리먼트에 data-file 속성이 명시되어 있는지 확인합니다.
                const fileToLoad = targetModal.getAttribute('data-file');
                
                if (fileToLoad) {
                    const modalBody = targetModal.querySelector('.modal-body');
                    
                    // 최초 1회만 콘텐츠를 불러오도록 검사
                    if (modalBody && !modalBody.getAttribute('data-loaded')) {
                        modalBody.innerHTML = '<h2>로딩 중...</h2>'; // 로딩 안내 메세지
                        
                        fetch(fileToLoad)
                            .then(response => {
                                if (!response.ok) throw new Error('Network response was not ok');
                                return response.text();
                            })
                            .then(html => {
                                // 가져온 HTML 문서 내에서 body 내용만 추출하여 삽입
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(html, 'text/html');
                                modalBody.innerHTML = doc.body.innerHTML;
                                modalBody.setAttribute('data-loaded', 'true');
                            })
                            .catch(err => {
                                modalBody.innerHTML = '<h2>오류</h2><p>프로젝트 정보를 불러오는 데 실패했습니다.</p>';
                                console.error(err);
                            });
                    }
                }

                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // 뒷배경 스크롤 방지
            }
        });
    });

    // 닫기 버튼 클릭 시 모달 닫기
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // 스크롤 복원
            }
        });
    });

    // 모달 바깥 어두운 배경 클릭 시 닫기
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
});

/* (중요) JS 파일 맨 마지막 줄에 아래 코드를 꼭 추가해 주세요! */
// 이미지 로딩 지연으로 인해 스크롤 트리거 작동 포인트가 엇나가는 것을 완전히 보정해 줍니다.
window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});