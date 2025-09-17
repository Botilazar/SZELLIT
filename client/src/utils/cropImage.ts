import { Area } from "react-easy-crop";
export async function getCroppedImg(imageSrc: string, pixelCrop: Area, fileName: string): Promise<File> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get canvas context");

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) throw new Error("Canvas is empty");
            const file = new File([blob], fileName, { type: blob.type });
            resolve(file);
        }, "image/jpeg");
    });
}
