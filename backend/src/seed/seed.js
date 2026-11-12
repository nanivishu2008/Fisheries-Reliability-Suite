import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Asset } from '../models/Asset.js';
import { Telemetry } from '../models/Telemetry.js';
import { Inspection } from '../models/Inspection.js';
import { Breakdown } from '../models/Breakdown.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { FailurePrediction } from '../models/FailurePrediction.js';
import { AIRecommendation } from '../models/AIRecommendation.js';
import { SparePart } from '../models/SparePart.js';
import { Notification } from '../models/Notification.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { AuditLog } from '../models/AuditLog.js';

export const seedDatabase = async () => {
  try {
    console.log('--- Starting Fisheries Reliability Suite Database Seeding ---');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Asset.deleteMany({}),
      Telemetry.deleteMany({}),
      Inspection.deleteMany({}),
      Breakdown.deleteMany({}),
      WorkOrder.deleteMany({}),
      FailurePrediction.deleteMany({}),
      AIRecommendation.deleteMany({}),
      SparePart.deleteMany({}),
      Notification.deleteMany({}),
      SystemSetting.deleteMany({}),
    ]);
    console.log('Cleared existing collections.');

    // 1. Seed Users (The 4 Required Roles)
    const adminUser = await User.create({
      name: 'Elena Rostova',
      email: 'admin@fisheries.org',
      password: 'AdminPass123!',
      role: 'Maintenance Admin',
      organization: 'AquaReliability Fisheries Ltd',
      assignedFacilities: ['South Bay Coastal Farm', 'Inland Hatchery Station', 'Deep Sea Fleet Base', 'Processing Plant 1'],
      phone: '+44 20 7946 0912',
      specialization: 'Asset Reliability Strategy & System Governance',
    });

    const managerUser = await User.create({
      name: 'Marcus Thorne',
      email: 'manager@fisheries.org',
      password: 'ManagerPass123!',
      role: 'Operations Manager',
      organization: 'AquaReliability Fisheries Ltd',
      assignedFacilities: ['South Bay Coastal Farm', 'Inland Hatchery Station'],
      phone: '+44 20 7946 0884',
      specialization: 'Aquaculture Production & Harvest Scheduling',
    });

    const techUser = await User.create({
      name: 'Liam Gallagher',
      email: 'tech@fisheries.org',
      password: 'TechPass123!',
      role: 'Technician',
      organization: 'AquaReliability Fisheries Ltd',
      assignedFacilities: ['South Bay Coastal Farm', 'Processing Plant 1'],
      phone: '+44 20 7946 0521',
      specialization: 'Marine Electro-Mechanical & Pneumatics',
    });

    const vendorUser = await User.create({
      name: 'Sarah Chen',
      email: 'vendor@marineparts.com',
      password: 'VendorPass123!',
      role: 'Vendor',
      organization: 'Maritime Industrial Services Ltd',
      assignedFacilities: ['Processing Plant 1', 'Deep Sea Fleet Base'],
      phone: '+44 20 7946 0337',
      specialization: 'Industrial Refrigeration & Compressor Diagnostics',
    });

    console.log('Seeded 4 core role users successfully.');

    // 2. Seed Assets (Covering All 8 Required Categories)
    const assetsData = [
      {
        assetCode: 'AER-001',
        name: 'Paddlewheel Aerator Unit 04',
        category: 'Aerators',
        subCategory: 'Dual Impeller Surface Aerator',
        location: 'South Bay Coastal Farm - Pond 4',
        manufacturer: 'AquaTech Maritime',
        model: 'PW-Pro 3000',
        serialNumber: 'AT-PW-98421',
        criticality: 'High',
        currentCondition: 'Warning',
        healthScore: 68,
        operationalStatus: 'Active',
        runtimeHours: 4820,
        maintenanceIntervalHours: 1000,
        monitoredParameters: [
          { parameter: 'Motor Temperature', unit: '°C', minSafeValue: 20, maxSafeValue: 75, currentValue: 78.4 },
          { parameter: 'Vibration', unit: 'mm/s', minSafeValue: 0.5, maxSafeValue: 4.5, currentValue: 4.8 },
          { parameter: 'Power Consumption', unit: 'kW', minSafeValue: 2.0, maxSafeValue: 3.8, currentValue: 3.6 },
        ],
      },
      {
        assetCode: 'COLD-001',
        name: 'Blast Freezer Storage Room A',
        category: 'Cold Rooms',
        subCategory: 'Industrial Ammonia Blast Chiller',
        location: 'Processing Plant 1 - Bay 2',
        manufacturer: 'FrigoMarine Systems',
        model: 'BF-40C-Titan',
        serialNumber: 'FM-BF-10928',
        criticality: 'Mission-Critical',
        currentCondition: 'Healthy',
        healthScore: 94,
        operationalStatus: 'Active',
        runtimeHours: 8400,
        maintenanceIntervalHours: 2000,
        monitoredParameters: [
          { parameter: 'Storage Temperature', unit: '°C', minSafeValue: -42, maxSafeValue: -28, currentValue: -35.2 },
          { parameter: 'Compressor Draw', unit: 'kW', minSafeValue: 12, maxSafeValue: 24, currentValue: 16.5 },
          { parameter: 'Refrigerant Pressure', unit: 'bar', minSafeValue: 8, maxSafeValue: 18, currentValue: 13.2 },
        ],
      },
      {
        assetCode: 'VES-001',
        name: 'F/V Ocean Vanguard Harvest Vessel',
        category: 'Vessels',
        subCategory: 'Twin-Screw Aquaculture Tender',
        location: 'Deep Sea Fleet Base - Berth 3',
        manufacturer: 'Bergen Marine AS',
        model: 'Aquatender 45m',
        serialNumber: 'BM-VES-7721',
        criticality: 'Mission-Critical',
        currentCondition: 'Critical',
        healthScore: 38,
        operationalStatus: 'Maintenance',
        runtimeHours: 6310,
        maintenanceIntervalHours: 500,
        monitoredParameters: [
          { parameter: 'Port Engine Temp', unit: '°C', minSafeValue: 65, maxSafeValue: 88, currentValue: 92.6 },
          { parameter: 'Hydraulic System Pressure', unit: 'bar', minSafeValue: 180, maxSafeValue: 250, currentValue: 145 },
          { parameter: 'Shaft Vibration', unit: 'mm/s', minSafeValue: 1.0, maxSafeValue: 4.0, currentValue: 5.6 },
        ],
      },
      {
        assetCode: 'ICE-001',
        name: 'Automated Flake Ice Generator #1',
        category: 'Ice Plants',
        subCategory: 'Continuous Seawater Ice Drum',
        location: 'Processing Plant 1 - Ice Depot',
        manufacturer: 'SubZero Industrial',
        model: 'DrumIce-50T',
        serialNumber: 'SZ-ID-44102',
        criticality: 'High',
        currentCondition: 'Healthy',
        healthScore: 92,
        operationalStatus: 'Active',
        runtimeHours: 3200,
        maintenanceIntervalHours: 1500,
        monitoredParameters: [
          { parameter: 'Evaporator Temperature', unit: '°C', minSafeValue: -26, maxSafeValue: -18, currentValue: -22.4 },
          { parameter: 'Water Feed Flow', unit: 'L/min', minSafeValue: 35, maxSafeValue: 60, currentValue: 48.0 },
        ],
      },
      {
        assetCode: 'PND-001',
        name: 'Shrimp Nursery Pond Complex #08',
        category: 'Ponds',
        subCategory: 'HDPE Lined Coastal Raceway',
        location: 'South Bay Coastal Farm - Sector B',
        manufacturer: 'AquaStructures Civil',
        model: 'Raceway-5000m3',
        serialNumber: 'AS-PND-08',
        criticality: 'High',
        currentCondition: 'Healthy',
        healthScore: 96,
        operationalStatus: 'Active',
        runtimeHours: 12000,
        maintenanceIntervalHours: 3000,
        monitoredParameters: [
          { parameter: 'Dissolved Oxygen', unit: 'mg/L', minSafeValue: 5.0, maxSafeValue: 9.5, currentValue: 7.2 },
          { parameter: 'Water Temperature', unit: '°C', minSafeValue: 24, maxSafeValue: 31, currentValue: 27.5 },
          { parameter: 'pH Level', unit: 'pH', minSafeValue: 7.4, maxSafeValue: 8.4, currentValue: 7.9 },
        ],
      },
      {
        assetCode: 'CAG-001',
        name: 'High-Sea Circular Cage Ring Alpha-02',
        category: 'Cages',
        subCategory: 'HDPE 120m Circumference Pen',
        location: 'Offshore Sea Site 4',
        manufacturer: 'PolarCirkel Marine',
        model: 'PC-120HD',
        serialNumber: 'PC-CAG-1202',
        criticality: 'Mission-Critical',
        currentCondition: 'Healthy',
        healthScore: 90,
        operationalStatus: 'Active',
        runtimeHours: 18500,
        maintenanceIntervalHours: 2500,
        monitoredParameters: [
          { parameter: 'Mooring Line Tension', unit: 'kN', minSafeValue: 80, maxSafeValue: 240, currentValue: 135 },
          { parameter: 'Collar Submergence Depth', unit: 'm', minSafeValue: 0.8, maxSafeValue: 1.5, currentValue: 1.1 },
        ],
      },
      {
        assetCode: 'NET-001',
        name: 'Predator Barrier Containment Netting #3',
        category: 'Nets',
        subCategory: 'Dyneema Reinforced Anti-Predator Mesh',
        location: 'Offshore Sea Site 4 - Cage 02',
        manufacturer: 'NetTech Aqua',
        model: 'ArmorNet-Ultra',
        serialNumber: 'NT-NET-3301',
        criticality: 'Medium',
        currentCondition: 'Warning',
        healthScore: 71,
        operationalStatus: 'Active',
        runtimeHours: 4200,
        maintenanceIntervalHours: 1000,
        monitoredParameters: [
          { parameter: 'Biofouling Mass Index', unit: '%', minSafeValue: 0, maxSafeValue: 35, currentValue: 28.5 },
          { parameter: 'Tensile Load', unit: 'kN', minSafeValue: 10, maxSafeValue: 45, currentValue: 22.0 },
        ],
      },
      {
        assetCode: 'PRC-001',
        name: 'Automated Salmon Filleting & Trim Station',
        category: 'Processing Equipment',
        subCategory: 'High-Speed Vision-Guided Filleting Line',
        location: 'Processing Plant 1 - Main Floor',
        manufacturer: 'Nordic Processing Tech',
        model: 'FilletMaster 600',
        serialNumber: 'NPT-FM-6029',
        criticality: 'High',
        currentCondition: 'Healthy',
        healthScore: 89,
        operationalStatus: 'Active',
        runtimeHours: 5120,
        maintenanceIntervalHours: 800,
        monitoredParameters: [
          { parameter: 'Blade Spindle Vibration', unit: 'mm/s', minSafeValue: 0.2, maxSafeValue: 3.5, currentValue: 2.1 },
          { parameter: 'Drive Motor Current', unit: 'A', minSafeValue: 8.0, maxSafeValue: 16.0, currentValue: 11.4 },
        ],
      },
    ];

    const createdAssets = await Asset.insertMany(assetsData);
    console.log(`Seeded ${createdAssets.length} assets across all 8 target categories.`);

    // 3. Seed Telemetry Records (Realistic historical points for trend charts)
    const telemetryRecords = [];
    const now = Date.now();
    for (const asset of createdAssets) {
      for (const param of asset.monitoredParameters) {
        for (let i = 24; i >= 0; i--) {
          const timestamp = new Date(now - i * 3600 * 1000);
          const variance = (Math.random() - 0.5) * 0.15 * param.currentValue;
          const readingValue = Number((param.currentValue + variance).toFixed(1));
          const isAnomaly = readingValue > param.maxSafeValue || readingValue < param.minSafeValue;

          telemetryRecords.push({
            assetId: asset._id,
            parameter: param.parameter,
            readingValue,
            unit: param.unit,
            isAnomaly,
            anomalyReason: isAnomaly ? `${param.parameter} out of bounds (${readingValue} ${param.unit})` : '',
            source: 'IOT_GATEWAY',
            timestamp,
          });
        }
      }
    }
    await Telemetry.insertMany(telemetryRecords);
    console.log(`Seeded ${telemetryRecords.length} historical telemetry records.`);

    // 4. Seed Breakdowns
    const aeratorAsset = createdAssets.find((a) => a.assetCode === 'AER-001');
    const vesselAsset = createdAssets.find((a) => a.assetCode === 'VES-001');

    await Breakdown.create([
      {
        assetId: vesselAsset._id,
        reportedBy: techUser._id,
        breakdownDate: new Date(now - 48 * 3600 * 1000),
        problemDescription: 'High thermal surge on port propulsion engine during heavy sea towing. Cooling water bypass suspected.',
        severity: 'Catastrophic',
        observedSymptoms: ['Engine heat alarm triggered (92.6°C)', 'Excessive shaft vibration (5.6 mm/s)', 'Oil pressure drop'],
        status: 'Work Order Created',
      },
      {
        assetId: aeratorAsset._id,
        reportedBy: techUser._id,
        breakdownDate: new Date(now - 120 * 3600 * 1000),
        problemDescription: 'Gearbox whine and rotor vibration reported during midnight peak aeration run.',
        severity: 'Major',
        observedSymptoms: ['Rotor vibration 4.8 mm/s', 'Motor drawing 3.6 kW continuous'],
        status: 'Investigating',
      },
    ]);
    console.log('Seeded breakdown reports.');

    // 5. Seed Work Orders (Populating all 8 Kanban Statuses)
    const workOrdersData = [
      {
        workOrderNumber: 'WO-2026-0001',
        assetId: vesselAsset._id,
        title: 'Emergency Port Engine Heat Exchanger Descaling & Seal Overhaul',
        description: 'Complete inspection and ultrasonic cleaning of marine cooling tubes. Replace all degraded high-temp nitrile seals.',
        priority: 'Emergency',
        status: 'In Progress',
        requiredSkill: 'Marine Diesel & Hydraulics',
        assignedTechnician: techUser._id,
        scheduledDate: new Date(now + 24 * 3600 * 1000),
        expectedDowntimeHours: 12,
        actualDowntimeHours: 6,
        partsRequired: [
          { partNumber: 'SP-SEAL-88', partName: 'Port Engine Seal Overhaul Kit', quantity: 1, isAvailable: true },
          { partNumber: 'SP-COOL-12', partName: 'Zinc Sacrificial Anodes (Set of 4)', quantity: 4, isAvailable: true },
        ],
        approval: {
          approvedBy: managerUser._id,
          approvedAt: new Date(now - 24 * 3600 * 1000),
          notes: 'Approved urgently to maintain harvest fleet schedule.',
        },
      },
      {
        workOrderNumber: 'WO-2026-0002',
        assetId: aeratorAsset._id,
        title: 'Paddlewheel Motor Bearing Replacement & Alignment',
        description: 'Replace worn SKF 6308 deep groove ball bearings and realign flexible spider coupling to eliminate 4.8 mm/s vibration.',
        priority: 'Urgent',
        status: 'Scheduled',
        requiredSkill: 'Electro-Mechanical Rotating Equipment',
        assignedTechnician: techUser._id,
        scheduledDate: new Date(now + 48 * 3600 * 1000),
        expectedDowntimeHours: 3.5,
        partsRequired: [
          { partNumber: 'SP-BRG-6308', partName: 'SKF 6308 Ball Bearings', quantity: 2, isAvailable: true },
          { partNumber: 'SP-LUB-SYN', partName: 'Synthetic Marine Grease 400g', quantity: 1, isAvailable: true },
        ],
      },
      {
        workOrderNumber: 'WO-2026-0003',
        assetId: createdAssets.find((a) => a.assetCode === 'NET-001')._id,
        title: 'Predator Net Power Washing & Anti-Fouling Re-Coating',
        description: 'Subsea ROV pressure washing of algae bio-mass and inspection of cage attachment shackles.',
        priority: 'Medium',
        status: 'Pending Review',
        requiredSkill: 'Subsea Netting Rigging',
        scheduledDate: new Date(now + 96 * 3600 * 1000),
        expectedDowntimeHours: 5,
        partsRequired: [
          { partNumber: 'SP-SHK-22', partName: 'Galvanized Rigging Shackles 22mm', quantity: 6, isAvailable: true },
        ],
      },
      {
        workOrderNumber: 'WO-2026-0004',
        assetId: createdAssets.find((a) => a.assetCode === 'COLD-001')._id,
        title: 'Refrigerant Circuit Pressure Test & Compressor Oil Filter Change',
        description: 'Routine 2000-hour service. Oil sampling, moisture indicator check, and micro-filter replacement.',
        priority: 'Low',
        status: 'Awaiting Verification',
        requiredSkill: 'Industrial Ammonia Refrigeration',
        assignedTechnician: techUser._id,
        scheduledDate: new Date(now - 12 * 3600 * 1000),
        completedDate: new Date(),
        expectedDowntimeHours: 2,
        actualDowntimeHours: 2,
        closureVerification: {
          isVerified: false,
          notes: 'Technician logged completion. Awaiting Manager physical walk-through signoff.',
        },
      },
      {
        workOrderNumber: 'WO-2026-0005',
        assetId: createdAssets.find((a) => a.assetCode === 'ICE-001')._id,
        title: 'Ice Drum Scraper Blade Sharpening & Lubrication',
        description: 'Inspect ice harvest blade clearance and verify water distribution manifold spray pattern.',
        priority: 'Low',
        status: 'Completed',
        requiredSkill: 'General Mechanical Maintenance',
        assignedTechnician: techUser._id,
        scheduledDate: new Date(now - 72 * 3600 * 1000),
        completedDate: new Date(now - 24 * 3600 * 1000),
        expectedDowntimeHours: 2,
        actualDowntimeHours: 1.8,
        closureVerification: {
          isVerified: true,
          verifiedBy: managerUser._id,
          verifiedAt: new Date(now - 20 * 3600 * 1000),
          notes: 'Inspected flake ice output volume and blade clearance. Satisfactory.',
        },
      },
      {
        workOrderNumber: 'WO-2026-0006',
        assetId: createdAssets.find((a) => a.assetCode === 'PRC-001')._id,
        title: 'Emergency Blade Synchronization Adjustment',
        description: 'Filleting blade sensor misalignment causing irregular cuts.',
        priority: 'Urgent',
        status: 'Reported',
        requiredSkill: 'High-Precision Cutting Automation',
        scheduledDate: new Date(now + 12 * 3600 * 1000),
        expectedDowntimeHours: 1.5,
      },
      {
        workOrderNumber: 'WO-2026-0007',
        assetId: createdAssets.find((a) => a.assetCode === 'CAG-001')._id,
        title: 'Mooring Bridle Tension Recalibration',
        description: 'Annual acoustic beacon tension inspection.',
        priority: 'Medium',
        status: 'Approved',
        requiredSkill: 'Marine Rigging',
        scheduledDate: new Date(now + 144 * 3600 * 1000),
        expectedDowntimeHours: 4,
        approval: {
          approvedBy: adminUser._id,
          approvedAt: new Date(),
          notes: 'Scheduled for calm weather window next week.',
        },
      },
    ];

    await WorkOrder.insertMany(workOrdersData);
    console.log(`Seeded ${workOrdersData.length} work orders across Kanban states.`);

    // 6. Seed Failure Predictions & AI Recommendations
    const pred1 = await FailurePrediction.create({
      assetId: aeratorAsset._id,
      failureType: 'Paddlewheel Impeller Shaft Bearing Degradation',
      riskScore: 78,
      riskLevel: 'Critical',
      remainingUsefulLifeHours: 54,
      confidenceScore: 0.91,
      contributingFactors: [
        { factor: 'Vibration Amplitude', severity: 'CRITICAL', description: 'Radial vibration at 4.8 mm/s exceeds dynamic ISO threshold.' },
        { factor: 'Motor Stator Temperature', severity: 'HIGH', description: 'Thermal dissipation peaked at 78.4°C.' },
        { factor: 'Operating Runtime', severity: 'MEDIUM', description: 'Continuous run of 4,820 hours nearing service envelope.' },
      ],
      explanation: 'Continuous vibration harmonics combined with elevated stator temperature indicates imminent bearing raceway micro-spalling.',
      modelVersion: 'HEURISTIC-RULE-v2.4',
      engineType: 'HEURISTIC_EXPLAINABLE',
      predictionTimestamp: new Date(),
      reviewStatus: 'Pending',
    });

    const pred2 = await FailurePrediction.create({
      assetId: vesselAsset._id,
      failureType: 'Cooling Tube Restriction & Cavitation Erosion',
      riskScore: 88,
      riskLevel: 'Critical',
      remainingUsefulLifeHours: 18,
      confidenceScore: 0.94,
      contributingFactors: [
        { factor: 'Cooling Jacket Temperature', severity: 'CRITICAL', description: 'Engine temp 92.6°C indicates restricted raw water flow.' },
        { factor: 'Hydraulic Pressure Deficit', severity: 'HIGH', description: 'Pressure dropped to 145 bar under standard towing RPM.' },
      ],
      explanation: 'Port propulsion engine exhibits severe thermal runaway characteristics with hydraulic cavitation risk during transit.',
      modelVersion: 'HEURISTIC-RULE-v2.4',
      engineType: 'HEURISTIC_EXPLAINABLE',
      predictionTimestamp: new Date(),
      reviewStatus: 'Pending',
    });

    await AIRecommendation.create([
      {
        assetId: aeratorAsset._id,
        predictionId: pred1._id,
        recommendationTitle: 'Replace Aerator Bearings & Re-grease Drive Coupling',
        maintenanceType: 'Component Overhaul',
        recommendedDate: new Date(now + 48 * 3600 * 1000),
        priority: 'Urgent',
        requiredSkills: ['Electro-Mechanical Rotating Equipment', 'Vibration Analysis'],
        probableSpareParts: ['SKF 6308 Bearings (x2)', 'Nitrile Oil Seal 45x65x8', 'Marine Synthetic Grease'],
        expectedDowntimeHours: 3.5,
        rationale: 'Preventive replacement before complete seizure protects pond oxygenation integrity and prevents costly motor burnout.',
        status: 'Pending',
      },
      {
        assetId: vesselAsset._id,
        predictionId: pred2._id,
        recommendationTitle: 'Urgent Heat Exchanger Cleanout & Marine Raw Water Impeller Replacement',
        maintenanceType: 'Preventive Inspection',
        recommendedDate: new Date(now + 24 * 3600 * 1000),
        priority: 'Emergency',
        requiredSkills: ['Marine Diesel Engineering', 'Heat Transfer Overhaul'],
        probableSpareParts: ['Raw Water Neoprene Impeller', 'Heat Exchanger O-Ring Kit', 'Zinc Sacrificial Anodes'],
        expectedDowntimeHours: 8,
        rationale: 'Port engine will suffer catastrophic thermal warping if deployed for scheduled Friday harvest run.',
        status: 'Pending',
      },
    ]);
    console.log('Seeded failure predictions and actionable AI recommendations.');

    // 7. Seed Spare Parts Catalog
    const sparePartsData = [
      {
        partNumber: 'SP-BRG-6308',
        name: 'SKF 6308-2RS Deep Groove Ball Bearing',
        category: 'Mechanical',
        compatibleCategories: ['Aerators', 'Processing Equipment', 'Ice Plants'],
        quantityOnHand: 14,
        minimumStockLevel: 4,
        unitCost: 28.5,
        supplier: 'Motion Industries Marine',
        storageBin: 'Bin M-04',
      },
      {
        partNumber: 'SP-SEAL-88',
        name: 'High-Temperature Nitrile Oil Seal 45x65x8',
        category: 'Mechanical',
        compatibleCategories: ['Vessels', 'Aerators'],
        quantityOnHand: 2,
        minimumStockLevel: 5, // Triggers low-stock alert
        unitCost: 14.2,
        supplier: 'Maritime Spares Ltd',
        storageBin: 'Bin S-12',
      },
      {
        partNumber: 'SP-DO-SEN-01',
        name: 'Optical Dissolved Oxygen Sensor Probe Cap',
        category: 'Sensory',
        compatibleCategories: ['Ponds', 'Cages'],
        quantityOnHand: 8,
        minimumStockLevel: 3,
        unitCost: 145.0,
        supplier: 'AquaSense Electronics',
        storageBin: 'Bin E-02',
      },
      {
        partNumber: 'SP-REF-404A',
        name: 'R404A Refrigerant Gas Cylinder (10kg)',
        category: 'Refrigeration',
        compatibleCategories: ['Cold Rooms', 'Ice Plants'],
        quantityOnHand: 6,
        minimumStockLevel: 2,
        unitCost: 195.0,
        supplier: 'CoolAir Industrial Ltd',
        storageBin: 'Gas Store B',
      },
      {
        partNumber: 'SP-SHK-22',
        name: 'Galvanized Marine Rigging Shackle 22mm',
        category: 'Structural',
        compatibleCategories: ['Cages', 'Nets'],
        quantityOnHand: 32,
        minimumStockLevel: 10,
        unitCost: 18.0,
        supplier: 'Oceanic Rigging UK',
        storageBin: 'Yard Bay 1',
      },
    ];
    await SparePart.insertMany(sparePartsData);
    console.log(`Seeded ${sparePartsData.length} spare parts.`);

    // 8. Seed Notifications
    await Notification.create([
      {
        recipientId: managerUser._id,
        title: 'Emergency Failure Risk Detected',
        message: 'F/V Ocean Vanguard port engine temperature and shaft vibration critical.',
        type: 'ALERT',
        severity: 'urgent',
        isRead: false,
      },
      {
        recipientId: techUser._id,
        title: 'Assigned Work Order WO-2026-0001',
        message: 'You have been assigned to Port Engine Overhaul on F/V Ocean Vanguard.',
        type: 'MAINTENANCE',
        severity: 'urgent',
        isRead: false,
      },
      {
        title: 'AI Recommendation Ready for Review',
        message: 'Predictive maintenance recommended for Paddlewheel Aerator Unit 04 before weekend.',
        type: 'AI_PREDICTION',
        severity: 'warning',
        isRead: false,
      },
    ]);
    console.log('Seeded notifications.');

    // 9. Seed System Settings
    await SystemSetting.create([
      {
        key: 'FAILURE_RISK_THRESHOLDS',
        category: 'AI_SETTINGS',
        value: { lowMax: 25, mediumMax: 50, highMax: 75, criticalMin: 75 },
        description: 'Normalized boundary thresholds for Failure Risk Classifications',
      },
      {
        key: 'TELEMETRY_ALERT_LIMITS',
        category: 'TELEMETRY_THRESHOLDS',
        value: {
          aeratorMaxTempC: 75,
          vibrationMaxMms: 4.5,
          dissolvedOxygenMinMgL: 4.0,
          coldRoomMaxTempC: -20,
        },
        description: 'Hard safety trigger boundaries for automated equipment telemetry alerts',
      },
      {
        key: 'MASTER_ASSET_CATEGORIES',
        category: 'ASSETS',
        value: [
          'Ponds',
          'Cages',
          'Vessels',
          'Aerators',
          'Nets',
          'Ice Plants',
          'Cold Rooms',
          'Processing Equipment',
        ],
        description: 'Standardized operational asset taxonomy across the aquaculture enterprise',
      },
    ]);
    console.log('Seeded system settings.');

    console.log('--- Database Seeding Completed Successfully! ---');
  } catch (err) {
    console.error('Database seeding error:', err);
    throw err;
  } finally {
    // If running as standalone script, disconnect
    if (process.argv[1]?.endsWith('seed.js')) {
      await disconnectDB();
    }
  }
};

// Execute if run directly via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
