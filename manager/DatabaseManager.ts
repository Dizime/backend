import { userModel, User } from "../models";

export class DatabaseManager {
  static async getUser(info: Partial<User>): Promise<User | null> {
    const user = await userModel.findOne(info);
    if (!user) return null;
    return user;
  }
  static async createUser(info: Omit<Partial<User>, "id"> & Pick<Required<User>, "id">): Promise<User> {
    const user = await userModel.create(info);
    await user.save();
    return user;
  }
  static async updateUser(id: string, info: Partial<Omit<User, "id">>): Promise<User> {
    const user = await userModel.findOne({ id });
    if (!user) throw new Error("User not found");
    Object.assign(user, info);
    await user.save();
    return user;
  }
  static async getMultiUsers(info: Partial<User>): Promise<User[]> {
    const users = await userModel.find(info);
    return users;
  }
}