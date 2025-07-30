import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface DetailedItemDialogProps {
  children: ReactNode;
  onClose: () => void;
}

const DetailedItemDialog = ({ children, onClose }: DetailedItemDialogProps) => {
  // Prevent background scroll on mount, restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="relative rounded-lg p-10 szellit-navbar max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
          {children}
        </div>
      </div>
    </>
  );
};

export default DetailedItemDialog;
