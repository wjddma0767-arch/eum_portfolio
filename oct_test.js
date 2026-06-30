// 스크롤 진행 퍼센트 나타내기
$(window).scroll(function () {
  let scrollY = ($(window).scrollTop() / ($(document).height() - $(window).height()) * 100).toFixed(3);
  $(".progressBar").css({
    "width": scrollY + "%"
  });
});

// 상단 네비게이션 및 스크롤 진행 바 상태 제어
$(window).scroll(function () {
  let top = document.getElementById("bar_top");
  if (!top) return;

  let navHeight = $("#bar_top").height() || 0;
  let thumHeight = $("#thum").height() || 0;
  let scrollY = $(window).scrollTop();

  if (thumHeight > 0) {
    if (scrollY > navHeight + thumHeight) {
      top.style.opacity = '1';
      top.style.position = 'fixed';
      top.style.backgroundColor = 'rgba(255, 255, 255, .95)';
    } else if (scrollY > navHeight) {
      top.style.opacity = '0';
    } else {
      top.style.opacity = '1';
      top.style.position = 'fixed';
    }
  } else {
    // 서브 배너(#thum) 높이가 없는 경우 상단 바가 상시 부드럽게 유지되도록 오동작을 방지합니다.
    top.style.opacity = '1';
    top.style.position = 'fixed';
    top.style.backgroundColor = 'rgba(255, 255, 255, .95)';
  }
});

$(document).ready(function () {
  $("html, body").animate({ scrollTop: 0 }, "fast");
  
  let isIntroFinished = false; // 타이핑 및 인트로 버튼 등장 완료 판단 플래그

  // 타이핑 효과 실행
  function typeWriter() {
    const text = "새로운 터닝포인트\nOCTOPUBRAIN"; // 타이핑할 문구
    let index = 0;
    let speed = 120; // 글자 타이핑 속도 (밀리초 단위)

    $("#text").empty(); // 타이핑 전 중복 텍스트 노출 방지용 초기화

    function typing() {
      if (index < text.length) {
        let target = $("#text");
        let char = text.charAt(index);
        target.html(target.html() + (char === "\n" ? "<br>" : char));
        index++;
        setTimeout(typing, speed);
      } else {
        showLogoAndScrollBtn(); // 타이핑 완료 후 로고 및 버튼 활성화
      }
    }

    typing();
  }

  function showLogoAndScrollBtn() {
    $(".logo").css({
      display: "block",
      opacity: 0,
      top: "-20px"
    }).animate({
      opacity: 1,
      top: "0px"
    }, 1000); // 1초 동안 부드럽게 나타남
    
    $("#scroll_btn").fadeIn(2000, function() {
      isIntroFinished = true; // 등장 모션이 정상 완료된 시점부터 스크롤 감지 이벤트 허용
    }); 
  }

  $(".logo, #scroll_btn").hide(); // 초기 상태 숨김
  typeWriter(); // 타이핑 효과 시작

  // #scroll_btn 클릭 시 .section02로 부드럽게 이동
  $("#scroll_btn a").on("click", function (e) {
    e.preventDefault();
    let target = $(".section02");

    if (target.length) {
      $("html, body").animate({ scrollTop: target.offset().top }, 600, "swing", function () {
        $("#scroll_btn").fadeOut(); // 이동 완료 후 감춤
      });
    }
  });

  // 스크롤 위치에 따른 스크롤 유도 버튼 fade 처리
  $(window).on("scroll", function () {
    if (!isIntroFinished) return; // 타이핑 종료 전에 마우스 휠 작동 시 오작동 예방

    var scrollTop = $(window).scrollTop();
    var section02Top = $(".section02").offset().top;

    if (scrollTop < section02Top - 50) {
      $("#scroll_btn").fadeIn();
    } else {
      $("#scroll_btn").fadeOut();
    }
  });

  /* 공통 - 스크롤 시 요소가 화면에 나타날 때 애니메이션 클래스 추가 */
  function fadeInOnScroll(element, animationClass, delay = 0) {
    $(window).on("scroll", function () {
      $(element).each(function (i) {
        let scrollTop = $(window).scrollTop();
        let elementTop = $(this).offset().top;
        let windowHeight = $(window).height();

        if (scrollTop + windowHeight > elementTop + 50) {
          // 중복 큐가 쌓이지 않도록 한 번 적용된 상태면 무시하도록 처리 (성능 향상)
          if (!$(this).hasClass(animationClass)) {
            $(this).delay(i * delay).queue(function () {
              $(this).addClass(animationClass).dequeue();
            });
          }
        }
      });
    }).scroll();
  }

  fadeInOnScroll(".fade-wrap h2, .fade-wrap span, .fade-wrap p", "slide-left", 300);
  fadeInOnScroll(".commitment .content ul li", "slide-up", 400);
  fadeInOnScroll(".keyft_wrap .content .img_box", "slide-up", 400);
  fadeInOnScroll(".keyft_wrap .ann ul li", "slide-up", 300);
  fadeInOnScroll(".inquiry font, .inquiry span, .inquiry a", "slide-left", 200);

  // Footer - 우측 하단 위로 가기 버튼 제어 및 노출 감지
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").addClass("visible");
    } else {
      $(".back-to-top").removeClass("visible");
    }
  });

  $(".back-to-top").on("click", function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, 600, "swing");
  });
});

// 문의하기 모달 제어
$(document).ready(function () {
  $("#inquiryModal").hide();
  
  $(".inquiry a:first-child").on("click", function (e) {
    e.preventDefault();
    // 모달을 flex 레이아웃 스타일을 온전히 유지하며 fade-in 하도록 유도
    $("#inquiryModal").css("display", "flex").hide().fadeIn(200);
  });
  
  $('.close').on('click', function() {
    $('#inquiryModal').fadeOut(200);
  });
  
  $(".submit-btn").on("click", function (e) {
    e.preventDefault();
    alert("제출이 완료되었습니다.");
    $("#inquiryModal").fadeOut(200);
  });
});s