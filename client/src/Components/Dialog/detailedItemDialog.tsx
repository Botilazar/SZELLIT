import { ReactNode } from "react";
import { X } from "lucide-react";

interface DetailedItemDialogProps {
  children: ReactNode;
  onClose: () => void;
}

const DetailedItemDialog = ({ children, onClose }: DetailedItemDialogProps) => {
  return (
    <>
      
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="relative  rounded-lg p-10 szellit-navbar max-w-4xl w-full"
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
