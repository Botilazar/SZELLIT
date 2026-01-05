import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

type ConfirmDeleteModalProps = {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const ConfirmDeleteModal = ({ open, onCancel, onConfirm }: ConfirmDeleteModalProps) => {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="szellit-navbar rounded-2xl shadow-xl w-80 p-6 text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                    >
                        <h2 className="text-xl font-semibold mb-3 szellit-text">
                            {t("deleteModal.title")}
                        </h2>

                        <p className="szellit-text mb-6 text-sm">
                            {t("deleteModal.subtitle")}
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
                            >
                                {t("deleteModal.cancel")}
                            </button>

                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                {t("deleteModal.confirm")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDeleteModal;
