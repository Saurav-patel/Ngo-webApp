import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDIDANRY_CLOUD_NAME,
    api_key: process.env.CLOUDIDANRY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }