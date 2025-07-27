import { Dialog } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const RESEND_COOLDOWN = 10; // seconds

type VerifyEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResend: () => void;
};

const VerifyEmailModal = ({
  isOpen,
  onClose,
  email,
  onResend,
}: VerifyEmailModalProps) => {
  const { t } = useTranslation();
  const [cooldown, setCooldown] = useState(0);

  const handleResend = () => {
    if (cooldown === 0) {
      onResend(); // Trigger resend logic
      setCooldown(RESEND_COOLDOWN); // Start cooldown
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-2">
            📩 {t("verifyEmailModal.title")}
          </Dialog.Title>
          <Dialog.Description className="text-gray-700 mb-4">
            {t("verifyEmailModal.description", { email })}
          </Dialog.Description>

          <div className="flex justify-between items-center">
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className={`text-blue-600 text-sm ${
                cooldown > 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:underline"
              }`}
            >
              📤{" "}
              {cooldown > 0
                ? `${t("verifyEmailModal.resendCooldown")} (${cooldown}s)`
                : t("verifyEmailModal.resend")}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VerifyEmailModal;
