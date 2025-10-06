export const uploadImage = (url: string) => {
    if (!url) return { success: false, message: "upload failed" };

    const imageUrl = url;
    return { success: true, url: imageUrl };
};