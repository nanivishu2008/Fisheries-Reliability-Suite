import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

let genAI = null;
if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  } catch (err) {
    console.warn('Gemini AI initialization notice:', err.message);
  }
}

/**
 * Transparent Condition-Based Heuristic Evaluation Engine (Rule-based Baseline)
 */
export const runHeuristicAssetEvaluation = (asset, telemetryRecords = []) => {
  const factors = [];
  let riskScore = 10;
  let failureType = 'Standard Component Wear';
  let rulHours = Math.max(120, asset.maintenanceIntervalHours - (asset.runtimeHours % asset.maintenanceIntervalHours));

  // Factor 1: Runtime Hours Evaluation
  const runtimeModulo = asset.runtimeHours % (asset.maintenanceIntervalHours || 500);
  const runtimeRatio = runtimeModulo / (asset.maintenanceIntervalHours || 500);

  if (runtimeRatio > 0.9) {
    riskScore += 35;
    factors.push({
      factor: 'Runtime Maintenance Threshold Overdue',
      severity: 'HIGH',
      description: `Asset runtime (${asset.runtimeHours} hrs) has exceeded 90% of service cycle (${asset.maintenanceIntervalHours} hrs).`,
    });
    rulHours = Math.min(rulHours, 48);
  } else if (runtimeRatio > 0.75) {
    riskScore += 20;
    factors.push({
      factor: 'Approaching Periodic Service Limit',
      severity: 'MEDIUM',
      description: `Operating hours (${asset.runtimeHours} hrs) approaching service inspection threshold.`,
    });
    rulHours = Math.min(rulHours, 160);
  }

  // Factor 2: Telemetry Anomaly Checks by Category
  const recentReadings = telemetryRecords.slice(0, 10);
  let hasThermalAnomaly = false;
  let hasVibrationAnomaly = false;
  let hasDOAnomaly = false;

  for (const t of recentReadings) {
    const param = (t.parameter || '').toLowerCase();
    const val = t.readingValue;

    if (param.includes('temp') && val > 75) {
      hasThermalAnomaly = true;
      riskScore += 25;
      factors.push({
        factor: 'Elevated Operating Temperature',
        severity: 'CRITICAL',
        description: `Monitored temperature peaked at ${val}${t.unit}, exceeding thermal ceiling of 75°C.`,
      });
    }

    if (param.includes('vibration') && val > 4.5) {
      hasVibrationAnomaly = true;
      riskScore += 30;
      factors.push({
        factor: 'Severe Rotational Vibration',
        severity: 'CRITICAL',
        description: `Vibration amplitude detected at ${val} mm/s, indicating mechanical misalignment or bearing fault.`,
      });
    }

    if (param.includes('oxygen') && val < 4.0) {
      hasDOAnomaly = true;
      riskScore += 25;
      factors.push({
        factor: 'Critical Dissolved Oxygen Drop',
        severity: 'HIGH',
        description: `Dissolved oxygen collapsed to ${val} mg/L, threatening aquatic stock respiration.`,
      });
    }
  }

  // Assign specific failure type based on detected telemetry symptoms
  if (hasVibrationAnomaly && hasThermalAnomaly) {
    failureType = 'Imminent Bearing Seizure & Stator Overheating';
    rulHours = Math.min(rulHours, 24);
  } else if (hasVibrationAnomaly) {
    failureType = 'Shaft Imbalance / Bearing Race Degradation';
    rulHours = Math.min(rulHours, 72);
  } else if (hasThermalAnomaly) {
    failureType = 'Cooling Circuit Restriction / Thermal Runaway';
    rulHours = Math.min(rulHours, 48);
  } else if (hasDOAnomaly) {
    failureType = 'Aeration Diffuser / Impeller Cavitation Defect';
    rulHours = Math.min(rulHours, 36);
  } else if (asset.currentCondition === 'Critical') {
    riskScore = Math.max(riskScore, 85);
    failureType = 'Compounded Electro-Mechanical Degradation';
    rulHours = Math.min(rulHours, 20);
  } else if (asset.currentCondition === 'Warning') {
    riskScore = Math.max(riskScore, 55);
    failureType = 'Sub-optimal Component Efficiency';
  }

  // Bound risk score between 5 and 98
  riskScore = Math.min(98, Math.max(5, riskScore));

  let riskLevel = 'Low';
  if (riskScore >= 75) riskLevel = 'Critical';
  else if (riskScore >= 50) riskLevel = 'High';
  else if (riskScore >= 25) riskLevel = 'Medium';

  const explanation = factors.length > 0
    ? `Heuristic Rule Assessment: Degradation indicators identified across ${factors.length} monitoring vectors. Primary concern: ${factors[0].description}`
    : `Operating parameters and runtime intervals for ${asset.name} are currently within nominal tolerance bounds.`;

  return {
    failureType,
    riskScore,
    riskLevel,
    remainingUsefulLifeHours: Math.round(rulHours),
    confidenceScore: 0.88,
    contributingFactors: factors.length > 0 ? factors : [{ factor: 'Nominal Runtime', severity: 'LOW', description: 'Parameters within expected bounds.' }],
    explanation,
    modelVersion: 'HEURISTIC-RULE-v2.4',
    engineType: 'HEURISTIC_EXPLAINABLE',
  };
};

/**
 * Gemini AI Failure Prediction & Synthesis Engine
 */
export const generateGeminiPrediction = async (asset, telemetryRecords = [], recentBreakdowns = []) => {
  // If no Gemini API key configured, seamlessly fallback to transparent baseline
  if (!config.geminiApiKey || !genAI) {
    return runHeuristicAssetEvaluation(asset, telemetryRecords);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert industrial reliability and aquaculture marine systems engineering AI.
Analyze the following asset operating data and return a strictly valid JSON object (no markdown, no backticks, just pure JSON).

Asset:
- Code: ${asset.assetCode}
- Name: ${asset.name}
- Category: ${asset.category} (${asset.subCategory || 'Standard'})
- Location: ${asset.location}
- Condition: ${asset.currentCondition}
- Runtime Hours: ${asset.runtimeHours}
- Maintenance Interval: ${asset.maintenanceIntervalHours}

Recent Telemetry Readings:
${JSON.stringify(telemetryRecords.slice(0, 8))}

Recent Breakdown Logs:
${JSON.stringify(recentBreakdowns.slice(0, 3))}

Respond ONLY with this JSON schema:
{
  "failureType": "string describing specific probable mechanical/electrical failure",
  "riskScore": number between 0 and 100,
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "remainingUsefulLifeHours": number of hours,
  "confidenceScore": number between 0.0 and 1.0,
  "contributingFactors": [
    {
      "factor": "string",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "description": "evidence-based sentence"
    }
  ],
  "explanation": "concise 2-sentence summary of root cause and urgency",
  "recommendation": {
    "title": "Action title",
    "maintenanceType": "Preventive Inspection" | "Component Overhaul" | "Lubrication & Balancing" | "Full Replacement",
    "priority": "Low" | "Medium" | "Urgent" | "Emergency",
    "expectedDowntimeHours": number,
    "requiredSkills": ["skill1", "skill2"],
    "probableSpareParts": ["part1", "part2"]
  }
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      ...parsed,
      modelVersion: 'GEMINI-1.5-FLASH-ENTERPRISE',
      engineType: 'GEMINI_AI',
    };
  } catch (err) {
    console.warn('Gemini API call failed or timed out, falling back to explainable baseline:', err.message);
    return runHeuristicAssetEvaluation(asset, telemetryRecords);
  }
};
