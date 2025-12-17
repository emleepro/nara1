// 로컬 스토리지 관리
const STORAGE_KEY = 'cxdx_assessment';
const HISTORY_KEY = 'cxdx_history';

// 현재 진단 결과 저장
function saveCurrentAssessment(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('저장 실패:', e);
        return false;
    }
}

// 현재 진단 결과 불러오기
function loadCurrentAssessment() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('불러오기 실패:', e);
        return null;
    }
}

// 진단 결과를 히스토리에 추가
function saveToHistory(results) {
    try {
        const history = getHistory();
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('ko-KR'),
            results: results
        };

        history.unshift(entry);

        // 최대 10개까지만 저장
        if (history.length > 10) {
            history.pop();
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        return true;
    } catch (e) {
        console.error('히스토리 저장 실패:', e);
        return false;
    }
}

// 히스토리 불러오기
function getHistory() {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('히스토리 불러오기 실패:', e);
        return [];
    }
}

// 가장 최근 결과 불러오기
function getLatestResult() {
    const history = getHistory();
    return history.length > 0 ? history[0] : null;
}

// 현재 진단 삭제
function clearCurrentAssessment() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        console.error('삭제 실패:', e);
        return false;
    }
}

// 히스토리 전체 삭제
function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (e) {
        console.error('히스토리 삭제 실패:', e);
        return false;
    }
}
