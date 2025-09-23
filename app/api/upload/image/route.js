import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import slugify from 'slugify';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function POST(request) {
  try {
    // Validasi environment variables
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      return NextResponse.json({
        success: false,
        message: 'ImageKit configuration not found'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const fileName = formData.get('fileName') || 'dish-image';
    const folder = formData.get('folder') || '/dishes'; // Default folder untuk dishes

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'File tidak ditemukan'
      }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');

    // Generate unique filename dengan timestamp
    const timestamp = Date.now();
    const slugifiedName = slugify(fileName.toString(), {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    const uniqueFileName = `${slugifiedName}-${timestamp}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName: uniqueFileName,
      folder: folder,
      transformation: {
        pre: 'l-text,i-Watermark,fs-20,l-end', // Optional: Add watermark
      },
      tags: ['dish', 'menu', 'food'] // Tags untuk organizing
    });

    return NextResponse.json({
      success: true,
      message: 'Gambar berhasil diupload',
      data: {
        fileId: uploadResponse.fileId,
        name: uploadResponse.name,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        size: uploadResponse.size,
        filePath: uploadResponse.filePath,
        // Generate different size versions
        urls: {
          original: uploadResponse.url,
          thumbnail: `${uploadResponse.url}?tr=w-150,h-150,c-maintain_ratio`,
          small: `${uploadResponse.url}?tr=w-300,h-300,c-maintain_ratio`,
          medium: `${uploadResponse.url}?tr=w-500,h-500,c-maintain_ratio`,
          large: `${uploadResponse.url}?tr=w-800,h-800,c-maintain_ratio`
        }
      }
    });

  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengupload gambar',
      error: error.message
    }, { status: 500 });
  }
}

// API untuk delete image dari ImageKit
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({
        success: false,
        message: 'File ID tidak ditemukan'
      }, { status: 400 });
    }

    // Delete from ImageKit
    await imagekit.deleteFile(fileId);

    return NextResponse.json({
      success: true,
      message: 'Gambar berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting from ImageKit:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus gambar',
      error: error.message
    }, { status: 500 });
  }
}