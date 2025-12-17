// 결과 표시
function showResults(results) {
    showPage('results-page');
    renderResults(results);
}

// 결과 렌더링
function renderResults(results) {
    const container = document.getElementById('results-content');

    container.innerHTML = `
        ${renderSummarySection(results)}
        ${renderChartsSection(results)}
        ${renderPriorityTasks(results)}
        ${renderDetailedAnalysis(results)}
    `;

    // 차트 렌더링
    renderRadarChart('cx-chart', results.cx);
    renderRadarChart('dx-chart', results.dx);
}

// 요약 섹션
function renderSummarySection(results) {
    return `
        <div class="summary-section">
            <h2>진단 요약</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">CX 성숙도</div>
                    <div class="summary-value">${results.cx.totalScore}점</div>
                    <div class="score-badge ${results.cx.maturityLevel.key}">${results.cx.maturityLevel.label}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">DX 성숙도</div>
                    <div class="summary-value">${results.dx.totalScore}점</div>
                    <div class="score-badge ${results.dx.maturityLevel.key}">${results.dx.maturityLevel.label}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">진단 일시</div>
                    <div class="summary-value" style="font-size: var(--font-size-lg);">${results.date}</div>
                </div>
            </div>
        </div>
    `;
}

// 차트 섹션
function renderChartsSection(results) {
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: var(--spacing-xl);">
            <div class="chart-container">
                <h3 class="chart-title">CX 성숙도 레이더 차트</h3>
                <div class="chart-wrapper">
                    <canvas id="cx-chart"></canvas>
                </div>
            </div>
            <div class="chart-container">
                <h3 class="chart-title">DX 성숙도 레이더 차트</h3>
                <div class="chart-wrapper">
                    <canvas id="dx-chart"></canvas>
                </div>
            </div>
        </div>
    `;
}

// 레이더 차트 렌더링
function renderRadarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.categories.map(c => c.name),
            datasets: [{
                label: data.name,
                data: data.categories.map(c => c.score),
                backgroundColor: data.color + '33',
                borderColor: data.color,
                borderWidth: 3,
                pointBackgroundColor: data.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 12,
                            family: "'Noto Sans KR', sans-serif"
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 13,
                            family: "'Noto Sans KR', sans-serif",
                            weight: '600'
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        family: "'Noto Sans KR', sans-serif"
                    },
                    bodyFont: {
                        size: 13,
                        family: "'Noto Sans KR', sans-serif"
                    },
                    callbacks: {
                        label: function (context) {
                            return context.parsed.r + '점';
                        }
                    }
                }
            }
        }
    });
}

// 우선순위 개선과제
function renderPriorityTasks(results) {
    const allCategories = [
        ...results.cx.categories.map(c => ({ ...c, type: 'CX' })),
        ...results.dx.categories.map(c => ({ ...c, type: 'DX' }))
    ];

    // 점수가 낮은 순으로 정렬
    allCategories.sort((a, b) => a.score - b.score);

    const top3 = allCategories.slice(0, 3);

    return `
        <div class="priority-tasks">
            <h2 class="priority-tasks-title">🎯 우선 개선 과제 TOP 3</h2>
            ${top3.map((task, index) => `
                <div class="priority-task-item">
                    <span class="priority-rank">${index + 1}</span>
                    <div class="priority-task-content">
                        <div class="priority-task-domain">
                            <strong>${task.type} - ${task.name}</strong> 
                            <span style="color: var(--text-secondary);">(${task.score}점 / ${task.maturityLevel.label})</span>
                        </div>
                        <div class="priority-task-description">
                            ${getRecommendationSummary(task.id, task.type.toLowerCase())}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 상세 분석
function renderDetailedAnalysis(results) {
    return `
        <h2 style="font-size: var(--font-size-2xl); font-weight: 700; margin: var(--spacing-2xl) 0 var(--spacing-lg);">
            영역별 상세 분석
        </h2>
        <div class="details-grid">
            ${results.cx.categories.map(cat => renderCategoryCard(cat, 'cx')).join('')}
            ${results.dx.categories.map(cat => renderCategoryCard(cat, 'dx')).join('')}
        </div>
    `;
}

// 카테고리 카드
function renderCategoryCard(category, type) {
    const recommendations = getRecommendations(category.id, type);

    return `
        <div class="score-card">
            <div class="score-header">
                <h3 class="score-title">${type.toUpperCase()} - ${category.name}</h3>
                <span class="score-badge ${category.maturityLevel.key}">${category.maturityLevel.label}</span>
            </div>
            <div class="score-value">${category.score}점</div>
            <p class="score-description">${category.maturityLevel.description}</p>
            
            <div class="recommendations">
                <h4 class="recommendations-title">💡 개선 제안</h4>
                <ul class="recommendation-list">
                    ${recommendations.map((rec, idx) => `
                        <li class="recommendation-item">
                            <div class="recommendation-icon">${idx + 1}</div>
                            <div class="recommendation-text">${rec}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
}

// 개선 제안 데이터베이스
const recommendationsDB = {
    cx: {
        customer_insight: [
            "고객 데이터 통합 플랫폼(CDP) 도입을 검토하여 다양한 채널의 데이터를 통합 관리하세요.",
            "정기적인 고객 인터뷰 및 설문을 통해 정성적 인사이트를 확보하세요.",
            "데이터 분석 전문가를 채용하거나 외부 파트너와 협업하여 분석 역량을 강화하세요."
        ],
        customer_journey: [
            "주요 고객 여정을 워크숍을 통해 시각화하고, 부서 간 공유하세요.",
            "각 접점별 KPI를 설정하고 정기적으로 모니터링하세요.",
            "고객 여정 개선을 위한 크로스펑셔널 태스크포스를 구성하세요."
        ],
        omnichannel: [
            "온·오프라인 재고 및 주문 정보를 실시간으로 통합하는 시스템을 구축하세요.",
            "모바일 앱과 웹사이트의 사용자 경험을 일관되게 개선하세요.",
            "채널별 고객 행동 데이터를 통합 분석하여 최적의 채널 믹스를 설계하세요."
        ],
        voc_feedback: [
            "VOC 수집 채널을 다양화하고, 자동 분류 시스템을 도입하세요.",
            "고객 피드백에 대한 응답 시간 목표를 설정하고 준수율을 관리하세요.",
            "VOC 기반 개선 사례를 정기적으로 공유하여 조직 내 확산하세요."
        ],
        cx_culture: [
            "경영진 주도의 CX 비전 선포 및 전사 캠페인을 실시하세요.",
            "CX 우수 사례를 발굴하고 포상하는 제도를 마련하세요.",
            "전 임직원 대상 CX 기본 교육을 정기적으로 실시하세요."
        ]
    },
    dx: {
        digital_strategy: [
            "DX 전담 조직을 신설하고, 명확한 권한과 책임을 부여하세요.",
            "3개년 DX 로드맵을 수립하고, 분기별 실행 계획을 구체화하세요.",
            "DX 성과를 측정할 수 있는 KPI를 정의하고 대시보드로 관리하세요."
        ],
        tech_infrastructure: [
            "레거시 시스템 현황을 진단하고, 단계적 클라우드 마이그레이션 계획을 수립하세요.",
            "반복 업무를 파악하고 RPA 도입 우선순위를 결정하세요.",
            "IT 보안 정책을 재정비하고, 정기적인 보안 점검을 실시하세요."
        ],
        data_analytics: [
            "데이터 거버넌스 정책을 수립하고, 데이터 오너를 지정하세요.",
            "BI 도구를 도입하여 주요 경영 지표를 실시간으로 모니터링하세요.",
            "데이터 리터러시 교육을 통해 전 직원의 데이터 활용 역량을 높이세요."
        ],
        people_capability: [
            "디지털 인재 채용 전략을 수립하고, 경쟁력 있는 처우를 제공하세요.",
            "사내 디지털 아카데미를 운영하여 지속적인 학습 기회를 제공하세요.",
            "스타트업, 테크 기업과의 파트너십을 통해 외부 역량을 활용하세요."
        ],
        innovation_culture: [
            "실패를 학습의 기회로 인정하는 문화를 조성하고, 사례를 공유하세요.",
            "사내 해커톤, 아이디어 공모전 등을 정기적으로 개최하세요.",
            "애자일 방법론 교육을 실시하고, 파일럿 프로젝트에 적용하세요."
        ]
    }
};

// 개선 제안 가져오기
function getRecommendations(categoryId, type) {
    return recommendationsDB[type][categoryId] || [
        "전문가와 상담하여 맞춤형 개선 방안을 수립하세요.",
        "업계 베스트 프랙티스를 벤치마킹하세요.",
        "단계적 실행 계획을 수립하고 정기적으로 점검하세요."
    ];
}

// 개선 제안 요약
function getRecommendationSummary(categoryId, type) {
    const recs = getRecommendations(categoryId, type);
    return recs[0];
}

// PDF 다운로드
async function downloadPDF() {
    // 라이브러리 확인
    if (typeof html2canvas === 'undefined') {
        alert('PDF 생성 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    // 결과 페이지 캡처
    const element = document.getElementById('results-content');
    const button = event ? event.target : null;

    try {
        // 로딩 표시
        if (button) {
            button.textContent = 'PDF 생성 중...';
            button.disabled = true;
        }

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');

        // jsPDF 인스턴스 생성 (여러 방식 시도)
        let pdf;
        if (window.jspdf && window.jspdf.jsPDF) {
            pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        } else if (typeof jsPDF !== 'undefined') {
            pdf = new jsPDF('p', 'mm', 'a4');
        } else {
            throw new Error('jsPDF 라이브러리를 찾을 수 없습니다.');
        }

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const fileName = `CX_DX_진단결과_${new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')}.pdf`;
        pdf.save(fileName);

        // 버튼 복원
        if (button) {
            button.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                PDF 다운로드
            `;
            button.disabled = false;
        }
    } catch (error) {
        console.error('PDF 생성 실패:', error);
        alert('PDF 다운로드에 실패했습니다.\n\n대안: 브라우저 메뉴에서 "인쇄" → "PDF로 저장"을 이용해주세요.');

        // 버튼 복원
        if (button) {
            button.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                PDF 다운로드
            `;
            button.disabled = false;
        }
    }
}

// 다시 진단하기
function retakeAssessment() {
    if (confirm('새로운 진단을 시작하시겠습니까?')) {
        startAssessment();
    }
}
