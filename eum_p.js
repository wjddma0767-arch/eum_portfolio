
    // 상태 관리 변수
    let editId = null; 
    let projects = JSON.parse(localStorage.getItem('flights_v3')) || [
        {
            id: 1, title: "UIUX 사이트 리뉴얼(필프레임)", category: "UIUX,상세페이지 디자인",
            image: "images/feelframe_logo.jpg",
            result: "매출률 증가",
            content: `...` // 기존 내용 유지
        }
    ];

    // 렌더링 함수 (기존과 동일)
    function renderWork(filter = 'all') {
        const grid = document.getElementById('portfolio-grid');
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

    // 모달 관리 (스크롤 방지 로직 보강)
    function openCareer() { 
        document.getElementById('careerModal').style.display = "block"; 
        document.body.style.overflow = "hidden"; 
    }
    
    function openAdmin() { 
        document.getElementById('adminModal').style.display = "block"; 
        document.body.style.overflow = "hidden"; // 배경 스크롤 방지 추가
    }

    function openCaseStudy(id) {
        const p = projects.find(p => p.id === id);
        document.getElementById('modal-body').innerHTML = p.content;
        document.getElementById('caseStudyModal').style.display = "block";
        document.body.style.overflow = "hidden";
    }

    function closeModal(id) { 
        document.getElementById(id).style.display = "none"; 
        document.body.style.overflow = "auto"; // 스크롤 복구
        if(id === 'adminModal') cancelEdit(); // 어드민 닫을 때 폼 초기화
    }

    // 어드민: 수정 모드 시작
    function startEdit(id) {
        const p = projects.find(proj => proj.id === id);
        if (!p) return;

        editId = id;
        document.getElementById('p-title').value = p.title;
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-image').value = p.image;
        document.getElementById('p-result').value = p.result || "";
        document.getElementById('p-content').value = p.content;

        // UI 변경
        document.getElementById('submit-btn').innerText = "Update Project";
        document.getElementById('submit-btn').classList.replace('bg-blue-600', 'bg-black');
        document.getElementById('form-mode').innerText = "MODE: EDIT PROJECT";
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        
        // 입력창으로 스크롤 이동
        document.getElementById('adminModal').scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 어드민: 수정 취소 (초기화)
    function cancelEdit() {
        editId = null;
        document.getElementById('p-title').value = "";
        document.getElementById('p-image').value = "";
        document.getElementById('p-result').value = "";
        document.getElementById('p-content').value = "";
        document.getElementById('submit-btn').innerText = "Add Project";
        document.getElementById('submit-btn').classList.replace('bg-black', 'bg-blue-600');
        document.getElementById('form-mode').innerText = "MODE: NEW PROJECT";
        document.getElementById('cancel-edit-btn').classList.add('hidden');
    }

    // 어드민: 저장 (추가 및 수정 통합)
    function saveProject() {
        const title = document.getElementById('p-title').value;
        if(!title) return alert("제목을 입력하세요");

        const projectData = {
            id: editId ? editId : Date.now(),
            title: title,
            category: document.getElementById('p-category').value,
            image: document.getElementById('p-image').value,
            result: document.getElementById('p-result').value || "In Progress",
            content: document.getElementById('p-content').value
        };

        if (editId) {
            // 수정
            const index = projects.findIndex(p => p.id === editId);
            projects[index] = projectData;
            alert("수정되었습니다.");
        } else {
            // 추가
            projects.push(projectData);
            alert("추가되었습니다.");
        }

        localStorage.setItem('flights_v3', JSON.stringify(projects));
        cancelEdit();
        renderWork();
        updateAdminList();
    }

    function deleteProject(id) {
        if(confirm("정말 삭제하시겠습니까?")) {
            projects = projects.filter(p => p.id !== id);
            localStorage.setItem('flights_v3', JSON.stringify(projects));
            renderWork(); 
            updateAdminList();
        }
    }

    function updateAdminList() {
        const list = document.getElementById('admin-list');
        list.innerHTML = projects.map(p => `
            <div class="flex justify-between items-center p-4 bg-white rounded-xl mb-2 text-sm font-bold shadow-sm border border-gray-100">
                <span class="truncate mr-4">${p.title}</span>
                <div class="flex gap-3 shrink-0">
                    <button onclick="startEdit(${p.id})" class="text-blue-600 hover:underline">EDIT</button>
                    <button onclick="deleteProject(${p.id})" class="text-red-500 hover:underline">DEL</button>
                </div>
            </div>
        `).join('');
    }

    function checkAdmin() {
        if(document.getElementById('adminPass').value === '076710') {
            document.getElementById('admin-auth').classList.add('hidden');
            document.getElementById('admin-form').classList.remove('hidden');
            updateAdminList();
        } else {
            alert("비밀번호가 틀렸습니다.");
        }
    }

    // 필터링 버튼 액티브 상태 개선
    function filterWork(cat) {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-black', 'text-white', 'shadow-sm');
            b.classList.add('text-gray-500');
        });
        event.target.classList.add('bg-black', 'text-white', 'shadow-sm');
        event.target.classList.remove('text-gray-500');
        renderWork(cat);
    }

    // 스크롤 및 초기화 이벤트
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) el.classList.add('active');
        });
    }

    window.onload = () => { renderWork(); reveal(); };
    window.addEventListener('scroll', () => {
    const scrollHint = document.getElementById('scroll-hint');
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    
    // 1. 스크롤 진행도 계산 (기존 코드)
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById("scroll-progress-bar").style.width = scrolled + "%";

    // 2. 스크롤 시 화살표 숨기기 (새로 추가)
    if (winScroll > 100) {
        scrollHint.style.opacity = "0";
        scrollHint.style.pointerEvents = "none";
    } else {
        scrollHint.style.opacity = "0.6";
    }

    reveal(); 
});
