// 페이지 전환
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// 랜딩 페이지로 이동
function goToLanding() {
    showPage('landing-page');
    checkPreviousResults();
}

// 이전 결과 확인
function checkPreviousResults() {
    const latestResult = getLatestResult();
    const loadBtn = document.getElementById('load-previous-btn');

    if (latestResult) {
        loadBtn.style.display = 'inline-flex';
    } else {
        loadBtn.style.display = 'none';
    }
}

// 이전 결과 불러오기
function loadPreviousResults() {
    const latestResult = getLatestResult();
    if (latestResult) {
        showResults(latestResult.results);
    } else {
        alert('저장된 결과가 없습니다.');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 이전 결과 버튼 표시 여부 확인
    checkPreviousResults();

    // 진행 중인 진단이 있는지 확인
    const savedAssessment = loadCurrentAssessment();
    if (savedAssessment && savedAssessment.answers) {
        const resume = confirm('진행 중인 진단이 있습니다. 이어서 하시겠습니까?');
        if (resume) {
            currentAssessment = savedAssessment;
            showPage('assessment-page');
            renderQuestion();
        } else {
            clearCurrentAssessment();
        }
    }
});

// 키보드 단축키
document.addEventListener('keydown', function (e) {
    const currentPage = document.querySelector('.page.active').id;

    if (currentPage === 'assessment-page') {
        // 숫자 키로 답변 선택
        if (e.key >= '1' && e.key <= '5') {
            const value = parseInt(e.key);
            const radio = document.querySelector(`input[name="answer"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                handleAnswer(value);
            }
        }

        // 화살표 키로 이동
        if (e.key === 'ArrowLeft' && !document.getElementById('prev-btn').disabled) {
            previousQuestion();
        }
        if (e.key === 'ArrowRight' && !document.getElementById('next-btn').disabled) {
            nextQuestion();
        }
    }
});

// 반응형 차트 크기 조정
window.addEventListener('resize', function () {
    const charts = Chart.instances;
    if (charts) {
        Object.values(charts).forEach(chart => {
            if (chart) chart.resize();
        });
    }
});

// 인쇄 전 처리
window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.btn, .btn-back, .results-actions').forEach(el => {
        el.style.display = 'none';
    });
});

window.addEventListener('afterprint', function () {
    document.querySelectorAll('.btn, .btn-back, .results-actions').forEach(el => {
        el.style.display = '';
    });
});
