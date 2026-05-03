import mongoose, { Document, Schema, Model } from 'mongoose';

export type ProductType = 'ai_sales_assistant' | 'ai_support_assistant' | 'ai_crm_assistant';

export interface IProductInstance extends Document {
  projectId: mongoose.Types.ObjectId;
  productType: ProductType;
  namespace: string;
  name: string;
  createdAt: Date;
}

const ProductInstanceSchema = new Schema<IProductInstance>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    productType: {
      type: String,
      enum: ['ai_sales_assistant', 'ai_support_assistant', 'ai_crm_assistant'],
      required: true,
    },
    namespace: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const ProductInstance: Model<IProductInstance> =
  mongoose.models.ProductInstance ??
  mongoose.model<IProductInstance>('ProductInstance', ProductInstanceSchema);
