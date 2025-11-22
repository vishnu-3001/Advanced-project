const API_BASE = process.env.REACT_APP_API_BASE || "https://starfish-app-9fd8s.ondigitalocean.app";

const ANALYSIS_PREFIX = "langgraph:analysis:";
const ANALYSIS_INDEX_KEY = `${ANALYSIS_PREFIX}index`;
const FULL_PREFIX = "langgraph:full:";
const FULL_INDEX_KEY = `${FULL_PREFIX}index`;

function hashString(value) {
    if (!value) return "0";
    let hash = 0;
    const str = String(value);
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

function loadIndex(indexKey) {
    try {
        const existing = sessionStorage.getItem(indexKey);
        return existing ? JSON.parse(existing) : [];
    } catch (err) {
        console.warn("Unable to read LangGraph cache index", err);
        return [];
    }
}

function storeIndex(indexKey, keys) {
    try {
        sessionStorage.setItem(indexKey, JSON.stringify(keys));
    } catch (err) {
        console.warn("Unable to persist LangGraph cache index", err);
    }
}

function updateIndex(indexKey, key) {
    const keys = loadIndex(indexKey);
    if (!keys.includes(key)) {
        keys.push(key);
        storeIndex(indexKey, keys);
    }
}

function clearIndexedCache(indexKey) {
    const keys = loadIndex(indexKey);
    keys.forEach((key) => sessionStorage.removeItem(key));
    sessionStorage.removeItem(indexKey);
}

export function clearAnalysisCache() {
    clearIndexedCache(ANALYSIS_INDEX_KEY);
}

function clearFullCache() {
    clearIndexedCache(FULL_INDEX_KEY);
}

export function clearWorkflowCache() {
    clearAnalysisCache();
    clearFullCache();
}

async function postJson(path, payload) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    return response.json();
}

export async function generateLangGraphProblem({ grade_level, difficulty, disability }) {
    clearWorkflowCache();
    const payload = {
        grade_level,
        difficulty,
        metadata: { refresh_problem: true },
    };
    if (disability) {
        payload.disability = disability;
    }
    const data = await postJson("/api/v2/langgraph/generate-problem", payload);
    return data?.results?.generated_problem || data;
}

export async function runLangGraphWorkflow(payload) {
    return postJson("/api/v2/langgraph/workflow", payload);
}

export async function runLangGraphFull(payload) {
    return postJson("/api/v2/langgraph/full-workflow", payload);
}
export async function runImprovementFlow(payload) {
    return postJson("/api/v2/langgraph/improvement_analysis", payload);
}

function buildAnalysisKey(payload, workflowType) {
    const grade = payload.grade_level || "7th";
    const difficulty = payload.difficulty || "medium";
    const disability = payload.disability || "No disability";
    const problemHash = hashString(payload.problem || payload.workflow_key || "");
    const attemptHash = hashString(payload.student_attempt || "");
    const responseHash = hashString(payload.student_response || "");
    return `${ANALYSIS_PREFIX}${workflowType}|${grade}|${difficulty}|${disability}|${problemHash}|${attemptHash}|${responseHash}`;
}

export function buildFullKey(payload) {
    const grade = payload.grade_level || "7th";
    const difficulty = payload.difficulty || "medium";
    const disability = payload.disability || "No disability";
    const problemHash = hashString(payload.problem || payload.workflow_key || "");
    return `${FULL_PREFIX}${grade}|${difficulty}|${disability}|${problemHash}`;
}

function storeCacheEntry(indexKey, key, value, lastKeyName) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        updateIndex(indexKey, key);
        if (lastKeyName) {
            sessionStorage.setItem(lastKeyName, key);
        }
    } catch (err) {
        console.warn("Unable to cache LangGraph response", err);
    }
}

export async function getOrRunAnalysis(payload, options = {}) {
    const workflowType = options.workflow_type || "analysis_only";
    const forceRefresh = options.forceRefresh || false;
    const key = buildAnalysisKey(payload, workflowType);

    if (!forceRefresh) {
        const cached = sessionStorage.getItem(key);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (err) {
                sessionStorage.removeItem(key);
            }
        }
    }

    const response = await runLangGraphWorkflow({ ...payload, workflow_type: workflowType });
    storeCacheEntry(ANALYSIS_INDEX_KEY, key, response, `${ANALYSIS_PREFIX}last`);
    return response;
}

export function getCachedAnalysis(payload, options = {}) {
    const workflowType = options.workflow_type || "analysis_only";
    const key = buildAnalysisKey(payload, workflowType);
    const cached = sessionStorage.getItem(key);
    if (!cached) {
        return null;
    }
    try {
        return JSON.parse(cached);
    } catch (err) {
        sessionStorage.removeItem(key);
        return null;
    }
}

export async function getOrRunFullWorkflow(payload, options = {}) {
    const forceRefresh = options.forceRefresh || false;
    const key = buildFullKey(payload);

    if (!forceRefresh) {
        const cached = sessionStorage.getItem(key);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (err) {
                sessionStorage.removeItem(key);
            }
        }
    }

    const response = await runLangGraphFull({ ...payload, workflow_type: "full" });
    storeCacheEntry(FULL_INDEX_KEY, key, response, `${FULL_PREFIX}last`);
    return response;
}
export async function getOrRunImprovementAnalysis(improvement_key,payload) {
    const cached= sessionStorage.getItem(improvement_key);
    if(cached){
        try{
            return JSON.parse(cached);
        }
        catch(err){
            sessionStorage.removeItem(improvement_key);
        }
    }
    const response=await runImprovementFlow(payload);
    try{
        sessionStorage.setItem(improvement_key,JSON.stringify(response));
        return response;
    }
    catch(err){
        console.warn("Unable to cache improvement analysis",err);
        return response;
    }
}


