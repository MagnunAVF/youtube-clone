import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ required: true, trim: true })
  displayName: string;

  // Optional for now: the no-auth `POST /users` flow doesn't set these.
  // Populated once signup/login land.
  @Prop({ trim: true, lowercase: true, unique: true, sparse: true })
  email?: string;

  @Prop()
  passwordHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
