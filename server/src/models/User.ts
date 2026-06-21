import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '@placementor/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  profile: {
    education?: string;
    skills?: string[];
    links?: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
    };
    bio?: string;
  };
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Omit<IUserDocument, 'password' | 'comparePassword' | 'toPublicJSON'>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.Student },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    profile: {
      education: { type: String },
      skills: [{ type: String }],
      links: {
        github: { type: String },
        linkedin: { type: String },
        portfolio: { type: String },
      },
      bio: { type: String },
    },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
},
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.index({ role: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);
