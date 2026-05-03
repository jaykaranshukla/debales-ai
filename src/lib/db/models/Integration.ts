import mongoose, { Document, Schema, Model } from 'mongoose';

export type IntegrationType = 'shopify' | 'crm';

export interface IIntegration extends Document {
  projectId: mongoose.Types.ObjectId;
  type: IntegrationType;
  name: string;
  enabled: boolean;
  mockData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    type: { type: String, enum: ['shopify', 'crm'], required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    mockData: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

IntegrationSchema.index({ projectId: 1, type: 1 }, { unique: true });

export const Integration: Model<IIntegration> =
  mongoose.models.Integration ??
  mongoose.model<IIntegration>('Integration', IntegrationSchema);

// ─── Static mock data ──────────────────────────────────────────────────────────
export const SHOPIFY_MOCK_DATA = {
  storeName: 'Acme Store',
  products: [
    { id: 'P001', name: 'Wireless Headphones Pro', price: 99.99, stock: 45, category: 'Electronics' },
    { id: 'P002', name: 'Smart Watch Series X', price: 249.99, stock: 12, category: 'Wearables' },
    { id: 'P003', name: 'Ergonomic Laptop Stand', price: 49.99, stock: 100, category: 'Accessories' },
    { id: 'P004', name: 'USB-C Hub 7-in-1', price: 39.99, stock: 78, category: 'Accessories' },
  ],
  recentOrders: [
    { id: 'O1001', customer: 'John Doe', total: 249.99, status: 'shipped', date: '2024-01-15' },
    { id: 'O1002', customer: 'Jane Smith', total: 149.98, status: 'processing', date: '2024-01-15' },
    { id: 'O1003', customer: 'Bob Johnson', total: 39.99, status: 'delivered', date: '2024-01-14' },
  ],
  revenue: { today: 1250.0, thisWeek: 8750.0, thisMonth: 32000.0 },
};

export const CRM_MOCK_DATA = {
  leads: [
    { id: 'L001', name: 'Alice Johnson', company: 'TechCorp', email: 'alice@techcorp.com', status: 'hot', estimatedValue: 5000 },
    { id: 'L002', name: 'Bob Wilson', company: 'StartupXYZ', email: 'bob@startupxyz.com', status: 'warm', estimatedValue: 2500 },
    { id: 'L003', name: 'Carol Davis', company: 'EnterpriseABC', email: 'carol@enterprise.com', status: 'cold', estimatedValue: 15000 },
  ],
  customers: [
    { id: 'C001', name: 'TechCorp Inc', plan: 'enterprise', mrr: 2000, since: '2023-06-01' },
    { id: 'C002', name: 'StartupXYZ', plan: 'pro', mrr: 500, since: '2023-09-15' },
  ],
  pipeline: { totalDeals: 15, totalValue: 75000, closingThisMonth: 3, conversionRate: '24%' },
};
