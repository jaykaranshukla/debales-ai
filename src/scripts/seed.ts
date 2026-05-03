/**
 * Seed script — run with: npm run seed
 * Seeds: 2 projects, 5 users, product instances, integrations, dashboard configs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not set in .env.local');
  process.exit(1);
}

// ─── Inline models to avoid Next.js module resolution issues ──────────────────
const MembershipSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, role: String }, { _id: false });
const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, memberships: [MembershipSchema] }, { timestamps: true });
const ProjectSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String }, { timestamps: true });
const ProductInstanceSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, productType: String, namespace: String, name: String }, { timestamps: true });
const IntegrationSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, type: String, name: String, enabled: Boolean, mockData: mongoose.Schema.Types.Mixed }, { timestamps: true });
IntegrationSchema.index({ projectId: 1, type: 1 }, { unique: true });

const WidgetSchema = new mongoose.Schema({ id: String, type: String, label: String, dataKey: String, order: Number }, { _id: false });
const SectionSchema = new mongoose.Schema({ id: String, title: String, order: Number, widgets: [WidgetSchema] }, { _id: false });
const DashboardConfigSchema = new mongoose.Schema({ projectId: { type: mongoose.Schema.Types.ObjectId, unique: true }, title: String, sections: [SectionSchema] }, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const ProductInstance = mongoose.models.ProductInstance || mongoose.model('ProductInstance', ProductInstanceSchema);
const Integration = mongoose.models.Integration || mongoose.model('Integration', IntegrationSchema);
const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', DashboardConfigSchema);

const SHOPIFY_DATA = {
  storeName: 'Acme Store',
  products: [
    { id: 'P001', name: 'Wireless Headphones Pro', price: 99.99, stock: 45 },
    { id: 'P002', name: 'Smart Watch Series X', price: 249.99, stock: 12 },
    { id: 'P003', name: 'Ergonomic Laptop Stand', price: 49.99, stock: 100 },
  ],
  recentOrders: [
    { id: 'O1001', customer: 'John Doe', total: 249.99, status: 'shipped' },
    { id: 'O1002', customer: 'Jane Smith', total: 149.98, status: 'processing' },
  ],
  revenue: { today: 1250, thisWeek: 8750, thisMonth: 32000 },
};

const CRM_DATA = {
  leads: [
    { id: 'L001', name: 'Alice Johnson', company: 'TechCorp', status: 'hot', estimatedValue: 5000 },
    { id: 'L002', name: 'Bob Wilson', company: 'StartupXYZ', status: 'warm', estimatedValue: 2500 },
  ],
  customers: [
    { id: 'C001', name: 'TechCorp Inc', plan: 'enterprise', mrr: 2000 },
    { id: 'C002', name: 'StartupXYZ', plan: 'pro', mrr: 500 },
  ],
  pipeline: { totalDeals: 15, totalValue: 75000, closingThisMonth: 3, conversionRate: '24%' },
};

function makeDashboardConfig(projectId: mongoose.Types.ObjectId, projectName: string) {
  return {
    projectId,
    title: `${projectName} — Admin Dashboard`,
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        order: 1,
        widgets: [
          { id: 'w1', type: 'stats_card', label: 'Total Conversations', dataKey: 'totalConversations', order: 1 },
          { id: 'w2', type: 'stats_card', label: 'Active Users', dataKey: 'activeUsers', order: 2 },
          { id: 'w3', type: 'stats_card', label: 'Messages Today', dataKey: 'messagesToday', order: 3 },
          { id: 'w4', type: 'stats_card', label: 'Total Messages', dataKey: 'totalMessages', order: 4 },
        ],
      },
      {
        id: 'integrations',
        title: 'Integrations',
        order: 2,
        widgets: [
          { id: 'w5', type: 'integration_status', label: 'Shopify Integration', order: 1 },
          { id: 'w6', type: 'integration_status', label: 'CRM Integration', order: 2 },
        ],
      },
      {
        id: 'activity',
        title: 'Recent Activity',
        order: 3,
        widgets: [
          { id: 'w7', type: 'recent_conversations', label: 'Recent Conversations', order: 1 },
        ],
      },
    ],
  };
}

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅  Connected to MongoDB');

  // Clear
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    ProductInstance.deleteMany({}),
    Integration.deleteMany({}),
    DashboardConfig.deleteMany({}),
  ]);
  console.log('🗑   Cleared existing data');

  const hash = await bcrypt.hash('password123', 10);

  // Projects
  const acme = await Project.create({ name: 'Acme Corp', slug: 'acme', description: 'Acme store sales assistant' });
  const techstart = await Project.create({ name: 'TechStart', slug: 'techstart', description: 'TechStart customer support' });
  console.log('📁  Created 2 projects');

  // Users
  await User.create([
    { name: 'Acme Admin', email: 'admin@acme.com', password: hash, memberships: [{ projectId: acme._id, role: 'admin' }] },
    { name: 'Acme Member', email: 'member@acme.com', password: hash, memberships: [{ projectId: acme._id, role: 'member' }] },
    { name: 'TechStart Admin', email: 'admin@techstart.com', password: hash, memberships: [{ projectId: techstart._id, role: 'admin' }] },
    { name: 'TechStart Member', email: 'member@techstart.com', password: hash, memberships: [{ projectId: techstart._id, role: 'member' }] },
    // Multi-project user
    { name: 'Super Admin', email: 'super@debales.ai', password: hash, memberships: [{ projectId: acme._id, role: 'admin' }, { projectId: techstart._id, role: 'admin' }] },
  ]);
  console.log('👤  Created 5 users');

  // Product instances
  await ProductInstance.create([
    { projectId: acme._id, productType: 'ai_sales_assistant', namespace: 'acme-sales', name: 'AI Sales Assistant' },
    { projectId: techstart._id, productType: 'ai_support_assistant', namespace: 'techstart-support', name: 'AI Support Assistant' },
  ]);
  console.log('🤖  Created 2 product instances');

  // Integrations
  await Integration.create([
    { projectId: acme._id, type: 'shopify', name: 'Shopify Store', enabled: true, mockData: SHOPIFY_DATA },
    { projectId: acme._id, type: 'crm', name: 'CRM System', enabled: false, mockData: CRM_DATA },
    { projectId: techstart._id, type: 'shopify', name: 'Shopify Store', enabled: false, mockData: SHOPIFY_DATA },
    { projectId: techstart._id, type: 'crm', name: 'CRM System', enabled: true, mockData: CRM_DATA },
  ]);
  console.log('🔌  Created 4 integrations (2 per project)');

  // Dashboard configs
  await DashboardConfig.create([
    makeDashboardConfig(acme._id, 'Acme Corp'),
    makeDashboardConfig(techstart._id, 'TechStart'),
  ]);
  console.log('📊  Created 2 dashboard configs');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅  Seed complete! Demo accounts:');
  console.log('   admin@acme.com       / password123  (admin, Acme Corp)');
  console.log('   member@acme.com      / password123  (member, Acme Corp)');
  console.log('   admin@techstart.com  / password123  (admin, TechStart)');
  console.log('   member@techstart.com / password123  (member, TechStart)');
  console.log('   super@debales.ai     / password123  (admin both projects)');
  console.log('\n🔧 Config-driven dashboard collection: dashboardconfigs');
  console.log('   Edit sections/widgets there → refresh /projects/<slug>/admin');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
