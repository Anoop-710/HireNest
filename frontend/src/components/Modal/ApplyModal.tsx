import { ReactNode } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

const ApplyModal = ({ children, onClose }: ModalProps) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg md:w-full w-3/4 max-w-md mx-auto p-4">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-900"
          onClick={onClose}
        >
          <X />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default ApplyModal;
