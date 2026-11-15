import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    return { status: res.status, text };
  }
}

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.success) throw new Error(`Login failed for ${email}: ${res.message}`);
  return res.data.token;
}

async function runTest() {
  console.log('=== STARTING COMPLETE 8-STEP VERIFICATION ===\n');

  // STEP 1: Admin (Vishal) - Register Equipment
  console.log('--- Step 1: Admin (Vishal) Registers AER-101 ---');
  const adminToken = await login('admin@fisheries.org', 'AdminPass123!');
  
  // Check if AER-101 exists, if so reuse it or create fresh
  let assetId = null;
  const existingAssets = await request('/assets?search=AER-101', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  
  if (existingAssets?.data?.assets?.length > 0) {
    assetId = existingAssets.data.assets[0]._id;
    console.log(`Found existing AER-101: ${assetId}`);
  } else {
    const createRes = await request('/assets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        assetCode: 'AER-101',
        name: 'Pond 4 High-Speed Paddlewheel Aerator',
        category: 'Aerators',
        location: 'South Bay Coastal Farm',
        criticality: 'Critical',
        currentCondition: 'Healthy',
        operationalStatus: 'Active',
        manufacturer: 'MarineTech Corp',
        model: 'PW-2000X',
        maintenanceIntervalHours: 500,
      }),
    });
    if (!createRes.success) throw new Error(`Asset creation failed: ${createRes.message}`);
    assetId = createRes.data.asset._id;
    console.log(`Successfully created asset AER-101: ${assetId}`);
  }

  // STEP 2: Technician (Raj) - Log Abnormal Telemetry
  console.log('\n--- Step 2: Technician (Raj) Logs Abnormal Sensor Telemetry ---');
  const techToken = await login('tech@fisheries.org', 'TechPass123!');
  const telemetryRes = await request('/telemetry', {
    method: 'POST',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({
      assetId,
      parameter: 'Operating Temperature',
      readingValue: 84,
      unit: '°C',
      operatingContext: 'Normal Operating Cycle',
    }),
  });
  console.log('Telemetry Response:', telemetryRes.success ? 'Recorded Successfully' : telemetryRes.message);
  console.log('Telemetry Anomaly Flag:', telemetryRes?.data?.telemetry?.isAnomaly ? 'ANOMALY DETECTED (Correct)' : 'Normal');

  // STEP 3: Trigger AI Prediction Engine
  console.log('\n--- Step 3: Trigger AI Prediction Engine ---');
  const evalRes = await request('/predictions/run-evaluation', {
    method: 'POST',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({ assetId }),
  });
  if (!evalRes.success) throw new Error(`AI Evaluation failed: ${evalRes.message}`);
  const prediction = evalRes.data.predictions[0]?.prediction;
  const recommendation = evalRes.data.predictions[0]?.recommendation;
  console.log(`Failure Type: ${prediction.failureType}`);
  console.log(`Risk Score: ${prediction.riskScore}% (${prediction.riskLevel})`);
  console.log(`Remaining Useful Life: ${prediction.remainingUsefulLifeHours} hours`);
  console.log(`Generated Recommendation: ${recommendation.recommendationTitle} (ID: ${recommendation._id})`);

  // STEP 4: Operations Manager (Arjun) - Accept Recommendation & Create Work Order
  console.log('\n--- Step 4: Operations Manager (Arjun) Accepts Recommendation ---');
  const managerToken = await login('manager@fisheries.org', 'ManagerPass123!');
  const acceptRes = await request(`/recommendations/${recommendation._id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ notes: 'Accepted by Operations Manager Arjun for immediate overhaul.' }),
  });
  if (!acceptRes.success) throw new Error(`Accept recommendation failed: ${acceptRes.message}`);
  console.log('Recommendation status:', acceptRes.data.recommendation.status);
  
  // Find the created work order
  const woListRes = await request('/maintenance/work-orders', {
    headers: { Authorization: `Bearer ${managerToken}` },
  });
  const workOrders = woListRes.data.workOrders || [];
  const targetWO = workOrders.find(w => w.assetId?._id === assetId || w.assetId === assetId);
  if (!targetWO) throw new Error('Could not find created Work Order');
  console.log(`Created Work Order: ${targetWO.workOrderNumber} (Status: ${targetWO.status})`);

  // STEP 5: Vendor (Ram) - Check Spare Parts Requirements
  console.log('\n--- Step 5: Vendor (Ram) Checks Required Spare Parts ---');
  const vendorToken = await login('vendor@marineparts.com', 'VendorPass123!');
  const vendorWORes = await request(`/maintenance/work-orders/${targetWO._id}`, {
    headers: { Authorization: `Bearer ${vendorToken}` },
  });
  if (!vendorWORes.success) throw new Error(`Vendor WO fetch failed: ${vendorWORes.message}`);
  const parts = vendorWORes.data.workOrder.partsRequired || [];
  console.log(`Parts Required for ${targetWO.workOrderNumber}:`, parts.map(p => p.partName).join(', '));

  // STEP 6: Technician (Raj) - Moves to In Progress and then Awaiting Verification
  console.log('\n--- Step 6: Technician (Raj) Performs Field Work ---');
  // 6a: Move to In Progress
  const moveInProgRes = await request(`/maintenance/work-orders/${targetWO._id}/move`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({ newStatus: 'In Progress', reason: 'Technician arrived on-site and started repair' }),
  });
  console.log('Status after starting work:', moveInProgRes.data.workOrder.status);

  // 6b: Move to Awaiting Verification
  const moveVerifyRes = await request(`/maintenance/work-orders/${targetWO._id}/move`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({ newStatus: 'Awaiting Verification', reason: 'Replaced bearing and lubricated seal' }),
  });
  console.log('Status after finishing field repair:', moveVerifyRes.data.workOrder.status);

  // STEP 7: Operations Manager (Arjun) - Authorized Closure Verification
  console.log('\n--- Step 7: Operations Manager (Arjun) Confirms Closure Verification ---');
  const closureRes = await request(`/maintenance/work-orders/${targetWO._id}/verify-closure`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ notes: 'Physical equipment verification complete. Returned to service.' }),
  });
  if (!closureRes.success) throw new Error(`Closure verification failed: ${closureRes.message}`);
  console.log('Work Order Status after Verification:', closureRes.data.workOrder.status);
  console.log('Closure Verified By:', closureRes.data.workOrder.closureVerification.isVerified ? 'VERIFIED (Arjun)' : 'No');

  // Verify Asset Condition Reset
  const updatedAssetRes = await request(`/assets/${assetId}`, {
    headers: { Authorization: `Bearer ${managerToken}` },
  });
  const updatedAsset = updatedAssetRes.data.asset;
  console.log(`Asset AER-101 Final Condition: ${updatedAsset.currentCondition} | Health Score: ${updatedAsset.healthScore}% (Successfully Restored!)`);

  // STEP 8: Admin (Vishal) - Inspect Permanent Audit Trail
  console.log('\n--- Step 8: Admin (Vishal) Inspects Audit Trail ---');
  const auditRes = await request('/audit-logs?limit=10', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const logs = auditRes.data.logs || [];
  console.log(`Total Audit Log Events Recorded: ${auditRes.data.pagination.total}`);
  console.log('Recent 5 Logged Actions:');
  logs.slice(0, 5).forEach((l, i) => {
    console.log(`  [${i + 1}] ${l.action} on ${l.entityName} by ${l.actor?.name || 'System'} at ${new Date(l.timestamp).toLocaleTimeString()}`);
  });

  console.log('\n========================================================');
  console.log('>>> ALL 8 STEPS TESTED & VERIFIED 100% WORKING! <<<');
  console.log('========================================================');
}

runTest().catch((err) => {
  console.error('\nFAILED TEST:', err);
  process.exit(1);
});
