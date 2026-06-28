if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger);

// 1. 섹션 1 애니메이션
const tlHero = gsap.timeline();
tlHero.from(".main-title, .sub-title", { y: 100, opacity: 0, duration: 1, ease: "power4.out" })
      .from(".png-obj", { y: -500, opacity: 0, stagger: 0.2, duration: 1.2, ease: "bounce.out" }, "-=0.5");

// 2. 섹션 2 가로 스크롤 및 피벗 효과 (코들 스타일)
const cards = gsap.utils.toArray(".card-item");
let lastIdx = -1; // 현재 화면 중심에 있는 카드 인덱스를 기억하는 변수

// cards-container 자체를 가로로 정밀 스크롤(translate)합니다.
// (카드 크기 + gap 크기를 완벽하게 합산하여 1, 2, 3번 모두 완벽히 뷰포트 정중앙에 안착합니다)
gsap.to(".cards-container", {
    x: () => {
        const cardWidth = cards[0].offsetWidth; // 카드의 실시간 가로폭 (450px)
        const gap = 100; // cards-container의 gap(100px)
        return -(cardWidth + gap) * (cards.length - 1);
    },
    ease: "none",
    scrollTrigger: {
        trigger: ".section-horizontal",
        pin: true,
        scrub: 1,
        start: "top top",
        end: "+=3000",
        onUpdate: (self) => {
            const progress = self.progress;
            const idx = Math.round(progress * (cards.length - 1));
            
            // 인덱스가 실제로 변경되었을 때만 3D 피벗 애니메이션을 실행하여 버벅임 제거
            if (idx !== lastIdx) {
                lastIdx = idx;
                
                cards.forEach((card, i) => {
                    card.classList.remove("active");
                    
                    // 지나간 카드 왼쪽으로 기울이기
                    if (i < idx) {
                        gsap.to(card, { rotationY: -35, rotationZ: -5, opacity: 0.3, scale: 0.8, duration: 0.3, overwrite: "auto" });
                    } 
                    // 현재 가운데 들어온 카드 정방향 노출
                    else if (i === idx) {
                        card.classList.add("active");
                        gsap.to(card, { rotationY: 0, rotationZ: 0, opacity: 1, scale: 1, duration: 0.3, overwrite: "auto" });
                    }
                    // 대기 중인 오른쪽 카드 대기각 세우기
                    else {
                        gsap.to(card, { rotationY: 35, rotationZ: 5, opacity: 0.5, scale: 0.9, duration: 0.3, overwrite: "auto" });
                    }
                });
            }
        }
    }
});
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


// [추가] 6. 모달(팝업) 열기 및 닫기 제어
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