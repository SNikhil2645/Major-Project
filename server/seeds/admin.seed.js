"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const dotenv_1 = require("dotenv");
const User_1 = require("../src/models/User");
const shared_1 = require("@placementor/shared");
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
(0, dotenv_1.config)({ path: '../.env' });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placementor';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@placementor.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
async function seed() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const existing = await User_1.User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        console.log('Admin already exists, skipping...');
        await mongoose_1.default.disconnect();
        return;
    }
    await User_1.User.create({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: shared_1.UserRole.Admin,
        isVerified: true,
    });
    console.log('Admin user created successfully');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=admin.seed.js.map