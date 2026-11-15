import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

export const clearDummyData = async () => {
  try {
    console.log('--- Clearing Dummy Data from Fisheries Reliability Suite ---');
    await connectDB();

    // 1. Clear operational collections
    await Promise.all([
      Asset.deleteMany({}),
      Telemetry.deleteMany({}),
      Inspection.deleteMany({}),
      Breakdown.deleteMany({}),
      WorkOrder.deleteMany({}),
      FailurePrediction.deleteMany({}),
      AIRecommendation.deleteMany({}),
      SparePart.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('Cleared: Assets, Telemetry, Inspections, Breakdowns, WorkOrders, Predictions, Recommendations, SpareParts, Notifications, and AuditLogs.');

    // 2. Ensure the 4 primary users exist for login
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      console.log('Seeding the 4 essential user accounts...');
      await User.create([
        {
          name: 'Vishal',
          email: 'admin@fisheries.org',
          password: 'AdminPass123!',
          role: 'Maintenance Admin',
          organization: 'AquaReliability Fisheries Ltd',
          assignedFacilities: ['South Bay Coastal Farm', 'North Harbor Hatchery', 'Processing Plant A'],
          phoneNumber: '+91 98765 43210',
          specialization: 'Asset Reliability Strategy & System Governance',
        },
        {
          name: 'Arjun',
          email: 'manager@fisheries.org',
          password: 'ManagerPass123!',
          role: 'Operations Manager',
          organization: 'AquaReliability Fisheries Ltd',
          assignedFacilities: ['South Bay Coastal Farm', 'North Harbor Hatchery'],
          phoneNumber: '+91 98765 43211',
          specialization: 'Aquaculture Production & Harvest Scheduling',
        },
        {
          name: 'Raj',
          email: 'tech@fisheries.org',
          password: 'TechPass123!',
          role: 'Technician',
          organization: 'AquaReliability Fisheries Ltd',
          assignedFacilities: ['South Bay Coastal Farm'],
          phoneNumber: '+91 98765 43212',
          specialization: 'Aeration Systems, Marine Pumps & Motors',
        },
        {
          name: 'Ram',
          email: 'vendor@marineparts.com',
          password: 'VendorPass123!',
          role: 'Vendor',
          organization: 'Marine Spares & Technical Logistics Corp',
          assignedFacilities: ['All Regions / Supplier Portal'],
          phoneNumber: '+91 98765 43213',
          specialization: 'OEM Marine Spares, Bearings, Seals, Impellers & Belts',
        },
      ]);
      console.log('Created 4 essential users: Vishal (Admin), Arjun (Manager), Raj (Tech), Ram (Vendor).');
    } else {
      console.log(`Retained ${usersCount} authorized user accounts.`);
    }

    console.log('--- Database is now completely clean and ready for your custom scenario! ---');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing dummy data:', err);
    process.exit(1);
  }
};

clearDummyData();
