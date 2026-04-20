function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function parseJsonLoose(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function validateRecommendationResult(payload, allowedIds, limit) {
  const obj = asObject(payload);
  if (!obj || !Array.isArray(obj.rankedCoaches)) return null;

  const allowed = new Set((allowedIds || []).map(String));
  const result = [];
  for (const row of obj.rankedCoaches) {
    const item = asObject(row);
    if (!item) continue;
    const userId = String(item.userId || '');
    if (!userId || !allowed.has(userId)) continue;
    const score = Number(item.score);
    const reasons = Array.isArray(item.reasons) ? item.reasons.map((x) => String(x).trim()).filter(Boolean) : [];
    result.push({
      userId,
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null,
      reasons: reasons.slice(0, 4),
    });
  }

  if (!result.length) return null;
  const unique = [];
  const seen = new Set();
  for (const r of result) {
    if (seen.has(r.userId)) continue;
    seen.add(r.userId);
    unique.push(r);
    if (unique.length >= limit) break;
  }
  return unique.length ? { rankedCoaches: unique } : null;
}

function validateTrainingPlanDraft(payload) {
  const obj = asObject(payload);
  if (!obj) return null;

  const title = String(obj.title || obj.planTitle || '').trim();
  const goals = String(obj.goals || obj.weeklyGoals || '').trim();
  const exercises = String(obj.exercises || obj.drills || obj.plan || '').trim();
  if (!title || !goals || !exercises) return null;

  return {
    title: title.slice(0, 180),
    goals: goals.slice(0, 5000),
    exercises: exercises.slice(0, 10000),
  };
}

module.exports = {
  parseJsonLoose,
  validateRecommendationResult,
  validateTrainingPlanDraft,
};
