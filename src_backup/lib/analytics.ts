const STORAGE_KEY = 'eldude_analytics';
const SESSION_KEY = 'eldude_session_id';

export interface AnalyticsData {
  totalViews: number;
  pages: Record<string, number>;
  daily: Record<string, number>;       // YYYY-MM-DD -> views
  sessions: string[];                  // unique session IDs
  lastVisits: { path: string; time: string; session: string }[];
}

function defaultData(): AnalyticsData {
  return { totalViews: 0, pages: {}, daily: {}, sessions: [], lastVisits: [] };
}

function load(): AnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultData(), ...JSON.parse(raw) } : defaultData();
  } catch {
    return defaultData();
  }
}

function save(data: AnalyticsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackPageView(path: string) {
  const data = load();
  const session = getSessionId();
  const today = new Date().toISOString().slice(0, 10);

  data.totalViews += 1;
  data.pages[path] = (data.pages[path] ?? 0) + 1;
  data.daily[today] = (data.daily[today] ?? 0) + 1;

  if (!data.sessions.includes(session)) {
    data.sessions.push(session);
    // Keep only last 5000 session IDs to avoid unbounded growth
    if (data.sessions.length > 5000) data.sessions = data.sessions.slice(-5000);
  }

  data.lastVisits.unshift({ path, time: new Date().toISOString(), session });
  if (data.lastVisits.length > 30) data.lastVisits = data.lastVisits.slice(0, 30);

  save(data);
}

export function getAnalytics(): AnalyticsData {
  return load();
}

export function getLast7Days(): { date: string; views: number }[] {
  const data = load();
  const result: { date: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, views: data.daily[key] ?? 0 });
  }
  return result;
}

export function getTopPages(limit = 5): { path: string; views: number }[] {
  const { pages } = load();
  return Object.entries(pages)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function resetAnalytics() {
  localStorage.removeItem(STORAGE_KEY);
}
