
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Info,
  X,
} from "lucide-react";

const FeedbackContext = createContext(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error(
      "useFeedback must be used inside FeedbackProvider"
    );
  }

  return context;
}

export function FeedbackProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);

  const resolverRef = useRef(null);
  const toastTimerRef = useRef(null);

  // =====================================
  // SUCCESS / ERROR / INFO NOTIFICATION
  // =====================================

  const notify = (message, type = "success", title = "") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      message,
      type,
      title:
        title ||
        (type === "success"
          ? "Success"
          : type === "error"
          ? "Something went wrong"
          : "Information"),
    });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // =====================================
  // CUSTOM CONFIRMATION
  // =====================================

  const confirmAction = ({
    title = "Are you sure?",
    message = "Do you want to continue?",
    details = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;

      setDialog({
        title,
        message,
        details,
        confirmText,
        cancelText,
        danger,
      });
    });
  };

  const closeDialog = (result) => {
    setDialog(null);

    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const toastStyles = {
    success: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    error: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    info: {
      icon: Info,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
  };

  const ToastIcon =
    toastStyles[toast?.type || "success"].icon;

  return (
    <FeedbackContext.Provider
      value={{ notify, confirmAction }}
    >
      {children}

      {/* =====================================
          CUSTOM CONFIRMATION MODAL
      ===================================== */}

      <AnimatePresence>
        {dialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeDialog(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
            >
              <div className="p-7 text-center">

                <div
                  className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
                    dialog.danger ? "bg-red-50" : "bg-blue-50"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${
                      dialog.danger ? "bg-red-100" : "bg-blue-100"
                    }`}
                  >
                    {dialog.danger ? (
                      <Trash2
                        size={29}
                        className="text-red-600"
                      />
                    ) : (
                      <AlertTriangle
                        size={29}
                        className="text-blue-600"
                      />
                    )}
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-gray-900">
                  {dialog.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {dialog.message}
                </p>

                {dialog.details && (
                  <div
                    className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${
                      dialog.danger
                        ? "border-red-100 bg-red-50 text-red-700"
                        : "border-blue-100 bg-blue-50 text-blue-700"
                    }`}
                  >
                    {dialog.details}
                  </div>
                )}

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => closeDialog(false)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition hover:bg-gray-100"
                  >
                    {dialog.cancelText}
                  </button>

                  <button
                    type="button"
                    onClick={() => closeDialog(true)}
                    className={`rounded-xl px-4 py-3 font-bold text-white shadow-lg transition ${
                      dialog.danger
                        ? "bg-red-600 shadow-red-200 hover:bg-red-700"
                        : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                    }`}
                  >
                    {dialog.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================
          SUCCESS / ERROR TOAST
      ===================================== */}

      <div className="pointer-events-none fixed right-4 top-4 z-[250] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 35, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 35, scale: 0.95 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${toastStyles[toast.type].border}`}
            >
              <div
                className={`rounded-xl p-2 ${toastStyles[toast.type].bg}`}
              >
                <ToastIcon
                  size={23}
                  className={toastStyles[toast.type].color}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">
                  {toast.title}
                </p>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close notification"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeedbackContext.Provider>
  );
}
