import { useState, useCallback } from "react";
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

    const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleDone = async () => {
        if (!croppedAreaPixels) return;
        const croppedFile = await getCroppedImg(URL.createObjectURL(file), croppedAreaPixels);
        onComplete(croppedFile);
    };

    return (
        <div className="szellit-overlay backdrop-blur-sm">
            <div className="szellit-modal p-6 w-[90%] max-w-lg relative">
                <div className="relative w-full h-96">
                    <Cropper
                        image={URL.createObjectURL(file)}
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
                    <button onClick={onCancel} className="szellit-button-secondary">
                        Cancel
                    </button>
                    <button onClick={handleDone} className="szellit-button-primary">
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropModal;
