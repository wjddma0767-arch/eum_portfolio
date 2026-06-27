gsap.registerPlugin(ScrollTrigger);

// 1. 섹션 1 애니메이션
const tlHero = gsap.timeline();
tlHero.from(".main-title, .sub-title", { y: 100, opacity: 0, duration: 1, ease: "power4.out" })
      .from(".png-obj", { y: -500, opacity: 0, stagger: 0.2, duration: 1.2, ease: "bounce.out" }, "-=0.5");

// 2. 섹션 2 가로 스크롤 및 피벗 효과 (코들 스타일)
const cards = gsap.utils.toArray(".card-item");
gsap.to(cards, {
    xPercent: -100 * (cards.length - 1),
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
            
            cards.forEach((card, i) => {
                card.classList.remove("active");
                // 지나간 카드 왼쪽으로 기울이기
                if (i < idx) {
                    gsap.to(card, { rotationY: -35, rotationZ: -5, opacity: 0.3, scale: 0.8, duration: 0.3 });
                } 
                // 현재 카드 똑바로
                else if (i === idx) {
                    card.classList.add("active");
                    gsap.to(card, { rotationY: 0, rotationZ: 0, opacity: 1, scale: 1, duration: 0.3 });
                }
                // 대기 중인 카드 오른쪽 대기
                else {
                    gsap.to(card, { rotationY: 35, rotationZ: 5, opacity: 0.5, scale: 0.9, duration: 0.3 });
                }
            });
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

// 5. 푸터 타이핑 및 이메일 강조
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
    start: "top 60%",
    onEnter: () => {
        typeWriter();
        gsap.from(".email-link", { scale: 0, opacity: 0, duration: 1, delay: 2, ease: "back.out(1.7)" });
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