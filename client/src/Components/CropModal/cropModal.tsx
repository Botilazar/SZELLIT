import { useState, useCallback, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage";

interface CropModalProps {
    file: File;
    onCancel: () => void;
    onComplete: (croppedFile: File) => void;
}

const CropModal = ({ file, onCancel, onComplete }: CropModalProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Always create a fresh blob URL for the current file
    const [imageUrl, setImageUrl] = useState<string>(URL.createObjectURL(file));

    useEffect(() => {
        const newUrl = URL.createObjectURL(file);
        setImageUrl(newUrl);

        return () => {
            URL.revokeObjectURL(newUrl);
        };
    }, [file]);

    const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleDone = async () => {
        if (!croppedAreaPixels) return;

        try {
            const croppedFile = await getCroppedImg(imageUrl, croppedAreaPixels, `user-${Date.now()}.png`);
            onComplete(croppedFile);

            // Revoke URL immediately after use
            URL.revokeObjectURL(imageUrl);
        } catch (err) {
            console.error("Error cropping image:", err);
        }
    };

    return (
        <div className="szellit-overlay">
            <div className="szellit-modal p-6 w-[90%] max-w-lg relative">
                <div className="relative w-full h-96 bg-gray-200 rounded-md overflow-hidden">
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <button className="szellit-button-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="szellit-button-primary" onClick={handleDone}>
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropModal;
