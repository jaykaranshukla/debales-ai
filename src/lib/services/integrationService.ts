import { connectDB } from '@/lib/db/connect';
import { Integration, IIntegration, SHOPIFY_MOCK_DATA, CRM_MOCK_DATA } from '@/lib/db/models/Integration';

export const integrationService = {
  async getByProject(projectId: string): Promise<IIntegration[]> {
    await connectDB();
    return Integration.find({ projectId }).lean();
  },

  async toggle(projectId: string, type: 'shopify' | 'crm', enabled: boolean): Promise<IIntegration> {
    await connectDB();
    const integration = await Integration.findOneAndUpdate(
      { projectId, type },
      { enabled },
      { new: true, upsert: true }
    );
    return integration.toObject();
  },

  async initForProject(projectId: string): Promise<void> {
    await connectDB();
    await Integration.findOneAndUpdate(
      { projectId, type: 'shopify' },
      {
        $setOnInsert: {
          projectId,
          type: 'shopify',
          name: 'Shopify Store',
          enabled: true,
          mockData: SHOPIFY_MOCK_DATA,
        },
      },
      { upsert: true }
    );
    await Integration.findOneAndUpdate(
      { projectId, type: 'crm' },
      {
        $setOnInsert: {
          projectId,
          type: 'crm',
          name: 'CRM System',
          enabled: false,
          mockData: CRM_MOCK_DATA,
        },
      },
      { upsert: true }
    );
  },
};
