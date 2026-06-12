    // 1. 초기 설정 및 데이터 로드
    let editId = null;
    let projects = JSON.parse(localStorage.getItem('flights_v3')) || [
        {
            id: 1, title: "UIUX 사이트 리뉴얼(필프레임)", category: "UIUX,상세페이지 디자인",
            image: "images/feelframe_logo.jpg",
            result: "매출률 증가",
            content: `<h1 class="text-5xl font-black italic">Feel Frame Case Study</h1><p class="mt-8 text-xl text-gray-500">동선 최적화를 통한 전환율 개선 사례입니다.</p>`
        }
    ];

    // 2. 새로고침 시 최상단 이동 로직
    window.onbeforeunload = function() { window.scrollTo(0, 0); };
    if (history.scrollRestoration) { history.scrollRestoration = 'manual'; }

    // 3. 포트폴리오 렌더링 함수
    function renderWork(filter = 'all') {
        const grid = document.getElementById('portfolio-grid');
        if(!grid) return;
        grid.innerHTML = '';
        const filtered = filter === 'all' ? projects : projects.filter(p => p.category.includes(filter));

        filtered.forEach((p) => {
            const div = document.createElement('div');
            div.className = "group cursor-pointer reveal";
            div.onclick = () => openCaseStudy(p.id);
            div.innerHTML = `
                <div class="relative overflow-hidden rounded-[40px] bg-gray-100 aspect-[1.3/1] mb-8 card-hover">
                    <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm">
                        <span class="px-10 py-4 bg-white text-black font-black text-sm rounded-full tracking-tighter uppercase italic">View Flight Log</span>
                    </div>
                </div>
                <div class="flex justify-between items-start px-4">
                    <div>
                        <span class="text-blue-600 font-black text-xs tracking-widest block mb-4 uppercase italic">Flight ${p.category}</span>
                        <h3 class="text-4xl font-black italic tracking-tighter group-hover:text-blue-600 transition uppercase">${p.title}</h3>
                    </div>
                    <div class="text-right">
                         <p class="text-xs font-bold text-gray-300 uppercase mb-1 tracking-widest">Impact</p>
                         <p class="font-black text-xl italic uppercase text-blue-600">${p.result}</p>
                    </div>
                </div>
            `;
            grid.appendChild(div);
        });
        setTimeout(reveal, 100);
    }

    // 4. 모달 관리 및 뒤로가기 기능 (History API 사용)
    function openModal(id) {
        document.getElementById(id).style.display = "block";
        document.body.style.overflow = "hidden";
        // 브라우저 히스토리에 가짜 상태 추가 (뒤로가기 시 모달만 닫히게 함)
        history.pushState({ modal: id }, '');
    }

    function closeModal(id) {
        document.getElementById(id).style.display = "none";
        document.body.style.overflow = "auto";
        // 뒤로가기로 닫힌 게 아닐 경우 히스토리 정리
        if (history.state && history.state.modal === id) {
            history.back();
        }
    }

    // 브라우저 뒤로가기 버튼 감지
    window.onpopstate = function(event) {
        document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        document.body.style.overflow = "auto";
    };

    function openCareer() { openModal('careerModal'); }
    function openAdmin() { openModal('adminModal'); }
    function openCaseStudy(id) {
        const p = projects.find(p => p.id === id);
        document.getElementById('modal-body').innerHTML = p.content;
        openModal('caseStudyModal');
    }

    // 5. 스크롤 애니메이션 및 UI 보정
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) el.classList.add('active');
        });
    }

    // 6. 어드민 관련 함수들
    function checkAdmin() {
        if(document.getElementById('adminPass').value === '076710') {
            document.getElementById('admin-auth').classList.add('hidden');
            document.getElementById('admin-form').classList.remove('hidden');
            updateAdminList();
        } else { alert("비밀번호가 틀렸습니다."); }
    }

    function startEdit(id) {
        const p = projects.find(proj => proj.id === id);
        if (!p) return;
        editId = id;
        document.getElementById('p-title').value = p.title;
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-image').value = p.image;
        document.getElementById('p-content').value = p.content;
        document.getElementById('submit-btn').innerText = "Update Project";
        document.getElementById('form-mode').innerText = "MODE: EDIT PROJECT";
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        document.getElementById('adminModal').scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        editId = null;
        document.getElementById('p-title').value = "";
        document.getElementById('p-image').value = "";
        document.getElementById('p-content').value = "";
        document.getElementById('submit-btn').innerText = "Add Project";
        document.getElementById('form-mode').innerText = "MODE: NEW PROJECT";
        document.getElementById('cancel-edit-btn').classList.add('hidden');
    }

    function saveProject() {
        const title = document.getElementById('p-title').value;
        if(!title) return alert("제목을 입력하세요");
        const data = {
            id: editId || Date.now(),
            title: title,
            category: document.getElementById('p-category').value,
            image: document.getElementById('p-image').value,
            result: "Impact Result",
            content: document.getElementById('p-content').value
        };
        if(editId) {
            const idx = projects.findIndex(p => p.id === editId);
            projects[idx] = data;
        } else { projects.push(data); }
        localStorage.setItem('flights_v3', JSON.stringify(projects));
        cancelEdit(); renderWork(); updateAdminList();
        alert("저장되었습니다.");
    }

    function deleteProject(id) {
        if(confirm("삭제하시겠습니까?")) {
            projects = projects.filter(p => p.id !== id);
            localStorage.setItem('flights_v3', JSON.stringify(projects));
            renderWork(); updateAdminList();
        }
    }

    function updateAdminList() {
        const list = document.getElementById('admin-list');
        list.innerHTML = projects.map(p => `
            <div class="flex justify-between items-center p-4 bg-white rounded-xl mb-2 text-sm font-bold shadow-sm border border-gray-100">
                <span class="truncate mr-4">${p.title}</span>
                <div class="flex gap-3 shrink-0">
                    <button onclick="startEdit(${p.id})" class="text-blue-600">EDIT</button>
                    <button onclick="deleteProject(${p.id})" class="text-red-500">DEL</button>
                </div>
            </div>
        `).join('');
    }

    function filterWork(cat) {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.className = "filter-btn px-8 py-3 text-gray-400 font-bold tracking-widest uppercase";
        });
        event.target.classList.add('bg-black', 'text-white', 'rounded-xl', 'shadow-lg');
        renderWork(cat);
    }

    // 7. 윈도우 스크롤 이벤트 (화살표 제어 및 진행도)
    window.addEventListener('scroll', () => {
        const scrollHint = document.getElementById('scroll-hint');
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        document.getElementById("scroll-progress-bar").style.width = scrolled + "%";

        // 스크롤 화살표 로직: 맨 위일 때만 보이고, 100px만 내려가도 투명하게 사라짐
        if (scrollHint) {
            if (winScroll > 50) {
                scrollHint.style.opacity = "0";
                scrollHint.style.pointerEvents = "none";
            } else {
                scrollHint.style.opacity = "0.6";
                scrollHint.style.pointerEvents = "auto";
            }
        }
        reveal(); 
    });

    // 8. 페이지 로드 시 보정 작업
    window.onload = () => {
        // 타이틀 글자 잘림 방지 (여백 강제 부여)
        const gradients = document.querySelectorAll('.text-gradient-animate');
        gradients.forEach(el => {
            el.style.paddingRight = "20px";
            el.style.display = "inline-block";
        });

        // 비행기 아이콘 겹침 방지 (버튼 간격 조정)
        const btn = document.querySelector('a[href="#work"]');
        if(btn) btn.classList.add('justify-center', 'gap-4');

        window.scrollTo(0, 0); // 다시 한 번 상단 고정
        renderWork();
        reveal();
    };
