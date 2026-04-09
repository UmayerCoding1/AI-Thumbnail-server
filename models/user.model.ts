import mongoose, { Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface iUser extends Document {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<iUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const User = models.User || model<iUser>("User", userSchema);
export default User;