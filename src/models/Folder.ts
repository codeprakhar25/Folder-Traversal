import mongoose, { Document, Schema, Model } from 'mongoose';

interface IFolder extends Document {
  name: string;
  parentId?: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
}

const FolderSchema: Schema = new Schema({
  name: { type: String, required: true },
  parentId: { type: mongoose.Types.ObjectId, ref: 'Folder', default: null },
  children: [{ type: mongoose.Types.ObjectId, ref: 'Folder' }],
});

const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);

export default Folder;
