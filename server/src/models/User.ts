import { timeStamp } from "console";
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
