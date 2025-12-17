// 진단 상태 관리
let currentAssessment = {
    currentQuestionIndex: 0,
    currentType: 'cx', // 'cx' or 'dx'
    answers: {},
    industry: null
};

// 모든 질문을 평탄화
function getAllQuestions() {
    const questions = [];

    // CX 질문
    assessmentData.cx.categories.forEach(category => {
        category.questions.forEach(q => {
            questions.push({
                ...q,
                type: 'cx',
                category: category.name,
                categoryId: category.id
            });
        });
    });

    // DX 질문
    assessmentData.dx.categories.forEach(category => {
        category.questions.forEach(q => {
            questions.push({
                ...q,
                type: 'dx',
                category: category.name,
                categoryId: category.id
            });
        });
    });

    return questions;
}

const allQuestions = getAllQuestions();

// 진단 시작
function startAssessment() {
    currentAssessment = {
        currentQuestionIndex: 0,
        currentType: 'cx',
        answers: {},
        industry: null,
        startTime: new Date().toISOString()
    };

    saveCurrentAssessment(currentAssessment);
    showPage('assessment-page');
    renderQuestion();
}

// 질문 렌더링
function renderQuestion() {
    const question = allQuestions[currentAssessment.currentQuestionIndex];
    const container = document.getElementById('question-container');

    // 섹션 탭 렌더링
    renderSectionTabs();

    // 진행률 업데이트
    updateProgress();

    container.innerHTML = `
        <div class="question-header">
            <span class="question-category">${question.category}</span>
            <h2 class="question-text">${question.text}</h2>
            <div class="question-tooltip">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4M12 8h.01"></path>
                </svg>
                <span>${question.tooltip}</span>
            </div>
        </div>
        
        <div class="likert-scale">
            <div class="likert-options">
                ${likertOptions.map(option => `
                    <div class="likert-option">
                        <input 
                            type="radio" 
                            id="option-${option.value}" 
                            name="answer" 
                            value="${option.value}"
                            ${currentAssessment.answers[question.id] === option.value ? 'checked' : ''}
                            onchange="handleAnswer(${option.value})"
                        >
                        <label for="option-${option.value}" class="likert-label">
                            <div class="likert-number">${option.value}</div>
                            <div class="likert-text">${option.label}</div>
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // 버튼 상태 업데이트
    updateButtons();
}

// 섹션 탭 렌더링
function renderSectionTabs() {
    const tabsContainer = document.getElementById('section-tabs');
    const currentQuestion = allQuestions[currentAssessment.currentQuestionIndex];

    const allCategories = [
        ...assessmentData.cx.categories.map(c => ({ ...c, type: 'cx' })),
        ...assessmentData.dx.categories.map(c => ({ ...c, type: 'dx' }))
    ];

    tabsContainer.innerHTML = allCategories.map(category => {
        const isActive = category.id === currentQuestion.categoryId;
        const isCompleted = isCategoryCompleted(category.id, category.type);

        return `
            <div class="section-tab ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                ${category.name}
            </div>
        `;
    }).join('');
}

// 카테고리 완료 여부 확인
function isCategoryCompleted(categoryId, type) {
    const categoryQuestions = allQuestions.filter(q =>
        q.categoryId === categoryId && q.type === type
    );

    return categoryQuestions.every(q => currentAssessment.answers[q.id] !== undefined);
}

// 진행률 업데이트
function updateProgress() {
    const totalQuestions = allQuestions.length;
    const answeredQuestions = Object.keys(currentAssessment.answers).length;
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);

    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = percentage + '%';
}

// 답변 처리
function handleAnswer(value) {
    const question = allQuestions[currentAssessment.currentQuestionIndex];
    currentAssessment.answers[question.id] = value;
    saveCurrentAssessment(currentAssessment);
    updateProgress();
    updateButtons();
}

// 버튼 상태 업데이트
function updateButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    // 이전 버튼
    prevBtn.disabled = currentAssessment.currentQuestionIndex === 0;

    // 다음/제출 버튼
    const isLastQuestion = currentAssessment.currentQuestionIndex === allQuestions.length - 1;
    const currentQuestion = allQuestions[currentAssessment.currentQuestionIndex];
    const isAnswered = currentAssessment.answers[currentQuestion.id] !== undefined;

    if (isLastQuestion) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
        submitBtn.disabled = !isAnswered;
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
        nextBtn.disabled = !isAnswered;
    }
}

// 다음 질문
function nextQuestion() {
    if (currentAssessment.currentQuestionIndex < allQuestions.length - 1) {
        currentAssessment.currentQuestionIndex++;
        saveCurrentAssessment(currentAssessment);
        renderQuestion();
    }
}

// 이전 질문
function previousQuestion() {
    if (currentAssessment.currentQuestionIndex > 0) {
        currentAssessment.currentQuestionIndex--;
        saveCurrentAssessment(currentAssessment);
        renderQuestion();
    }
}

// 진단 제출
function submitAssessment() {
    // 모든 질문에 답했는지 확인
    const allAnswered = allQuestions.every(q => currentAssessment.answers[q.id] !== undefined);

    if (!allAnswered) {
        alert('모든 질문에 답변해주세요.');
        return;
    }

    // 결과 계산
    const results = calculateResults();

    // 히스토리에 저장
    saveToHistory(results);

    // 현재 진단 삭제
    clearCurrentAssessment();

    // 결과 페이지로 이동
    showResults(results);
}

// 결과 계산
function calculateResults() {
    const results = {
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('ko-KR'),
        cx: calculateTypeResults('cx'),
        dx: calculateTypeResults('dx'),
        industry: currentAssessment.industry
    };

    return results;
}

// 타입별 결과 계산 (CX 또는 DX)
function calculateTypeResults(type) {
    const typeData = assessmentData[type];
    const categoryResults = [];

    typeData.categories.forEach(category => {
        const categoryQuestions = category.questions;
        const scores = categoryQuestions.map(q => currentAssessment.answers[q.id]);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const score = Math.round(average * 20); // 100점 만점으로 환산

        categoryResults.push({
            id: category.id,
            name: category.name,
            score: score,
            maturityLevel: getMaturityLevel(score)
        });
    });

    // 전체 평균 계산
    const totalScore = Math.round(
        categoryResults.reduce((sum, cat) => sum + cat.score, 0) / categoryResults.length
    );

    return {
        name: typeData.name,
        color: typeData.color,
        totalScore: totalScore,
        maturityLevel: getMaturityLevel(totalScore),
        categories: categoryResults
    };
}
