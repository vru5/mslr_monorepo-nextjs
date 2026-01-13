/**
 * Script for entering the code into MongoDb
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import preAuthorizedScc from './models/preAuthorizedScc.js';
import crypto from 'crypto';
import voter from './models/voter.js';
import referendum from './models/referendum.js'; // Import your referendum model

dotenv.config();

const codes = [
  "1AZN0FXJVM", "JOV50TOSYR", "SDUBJ5IOYB", "YFUVLYBQZR", "IGBQET8OOY",
  "R2ZHBUYO2V", "Z9HOC1LF4X", "9IJKHGHJK4", "N5J53QK9FO", "ZDN06T01V9",
  "4XRDN9O4AW", "921664ML8D", "A546AKU16A", "V0GB2G690L", "12EOU5RGVX",
  "0IXYCAH8UW", "GKJ3K1YBGE", "46HJV9KH1F", "S6K3AV3IVR", "IKKSZYJTSH"
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB for seeding...");

    // 1. Clear existing codes to avoid duplicates
    await preAuthorizedScc.deleteMany({});
    const sccDocs = codes.map(code => ({ scc: code, isUsed: false }));
    await preAuthorizedScc.insertMany(sccDocs);
    console.log(`Successfully imported ${codes.length} SCC codes!`);

    // 2. Seed Election Commission Admin
    const ecPassword = "Shangrilavote&2025@";
    const ecPasswordHashed = crypto.createHash('sha256').update(ecPassword).digest('hex');

    await voter.findOneAndUpdate(
      { email: "ec@referendum.gov.sr" },
      {
        fullName: "Election Comission",
        email: "ec@referendum.gov.sr",
        hashedPassword: ecPasswordHashed,
        scc: "ADMIN00001",
        dob: new Date("1900-01-01"),
        role: "admin"
      },
      { upsert: true, new: true }
    );
    console.log("Election Comission account entered.");

    // 3. Seed Default Referendums
    const defaultReferendums = [
      {
        referendum_title: "Expansion of Administration",
        referendum_desc: "Should Shangri-La pursue an expansion of its \nadministrative boundaries to incorporate adjacent counties?",
        status: "open",
        referendum_options: [
          { text: " Expand its boundaries to include all adjacent counties.", votes: 0 },
          { text: " Remain status quo", votes: 0 }
        ]
      },
      {
        referendum_title: "Should Shangri-La prohibit cigarette sales?",
        referendum_desc: "description",
        status: "open",
        referendum_options: [
          { text: "Yes", votes: 0 },
          { text: "No", votes: 0 }
        ]
      }
    ];

    for (const refData of defaultReferendums) {
      await referendum.findOneAndUpdate(
        { referendum_title: refData.referendum_title }, // Check if title exists
        refData,
        { upsert: true, new: true }
      );
    }
    console.log("Default referendums entered.");

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedDatabase();