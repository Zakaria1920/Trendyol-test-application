// cloudinary credentials
const cloudName = "dbhxstvst";
const uploadPreset = "demo_trendyol";

async function uploadToCloudinary(url, publicId, options = {}) {
try {
  const formData = new FormData();
  formData.append("file", url);
  formData.append("upload_preset", uploadPreset);
  formData.append("public_id", publicId);

  const {width, height, crop, quality, format } = options;

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  const formatedImages = data.secure_url.replace("/upload", `/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}`);
  return formatedImages;
} catch (error) {
    throw error;
}
}
// export uploadToCloudinary
export { uploadToCloudinary };