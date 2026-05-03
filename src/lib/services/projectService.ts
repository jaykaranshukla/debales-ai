import { connectDB } from '@/lib/db/connect';
import { Project, IProject } from '@/lib/db/models/Project';
import { User } from '@/lib/db/models/User';
import { ProductInstance } from '@/lib/db/models/ProductInstance';
import { Membership } from '@/types/next-auth';

export const projectService = {
  async getBySlug(slug: string): Promise<IProject | null> {
    await connectDB();
    return Project.findOne({ slug }).lean();
  },

  async getById(id: string): Promise<IProject | null> {
    await connectDB();
    return Project.findById(id).lean();
  },

  /** Get all projects the user is a member of */
  async getUserProjects(memberships: Membership[]): Promise<IProject[]> {
    await connectDB();
    const projectIds = memberships.map((m) => m.projectId);
    return Project.find({ _id: { $in: projectIds } }).lean();
  },

  async getProductInstances(projectId: string) {
    await connectDB();
    return ProductInstance.find({ projectId }).lean();
  },

  async getFirstProductInstance(projectId: string) {
    await connectDB();
    return ProductInstance.findOne({ projectId }).lean();
  },
};
