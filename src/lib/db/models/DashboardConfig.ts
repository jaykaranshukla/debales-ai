import mongoose, { Document, Schema, Model } from 'mongoose';

export type WidgetType =
  | 'stats_card'
  | 'integration_status'
  | 'recent_conversations'
  | 'activity_feed';

export interface IWidget {
  id: string;
  type: WidgetType;
  label: string;
  dataKey?: string;
  order: number;
}

export interface ISection {
  id: string;
  title: string;
  order: number;
  widgets: IWidget[];
}

export interface IDashboardConfig extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  sections: ISection[];
  updatedAt: Date;
}

const WidgetSchema = new Schema<IWidget>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['stats_card', 'integration_status', 'recent_conversations', 'activity_feed'],
      required: true,
    },
    label: { type: String, required: true },
    dataKey: { type: String },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    widgets: { type: [WidgetSchema], default: [] },
  },
  { _id: false }
);

const DashboardConfigSchema = new Schema<IDashboardConfig>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
    title: { type: String, required: true },
    sections: { type: [SectionSchema], default: [] },
  },
  { timestamps: true }
);

export const DashboardConfig: Model<IDashboardConfig> =
  mongoose.models.DashboardConfig ??
  mongoose.model<IDashboardConfig>('DashboardConfig', DashboardConfigSchema);
