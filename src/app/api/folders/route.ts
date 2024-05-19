import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Folder from '@/models/Folder';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const folders = await Folder.find({});
    return NextResponse.json({ success: true, data: folders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const data = await req.json();

  try {
    const folder = await Folder.create(data);
    return NextResponse.json({ success: true, data: folder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const { id } = params;
  const data = await req.json();

  try {
    const folder = await Folder.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!folder) {
      return NextResponse.json({ success: false, message: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: folder }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const { id } = params;

  try {
    const deletedFolder = await Folder.deleteOne({ _id: id });
    if (!deletedFolder) {
      return NextResponse.json({ success: false, message: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }
}
