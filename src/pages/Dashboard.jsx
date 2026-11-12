
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

import {
  Users,
  Receipt,
  Wallet,
  IndianRupee,
  Clock,
  CalendarDays,
  Bell,
  TrendingUp,
  Flower2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const API_URL = "http://https://florabill-backend.onrender.com/api/customers";

// ==============================
// ANIMATION VARIANTS
// ==============================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// ==============================
// DASHBOARD
// ==============================

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // ==============================
  // FETCH CUSTOMERS
  // ==============================

  const fetchCustomers = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load dashboard"
        );
      }

      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err.message || "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ==============================
  // LIVE DATE AND TIME
  // ==============================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const indianDate = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(currentTime);

  const indianTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(currentTime);

  // ==============================
  // BUSINESS CALCULATIONS
  // ==============================

  const totalCustomers = customers.length;

  const totalBill = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.totalBill || 0),
    0
  );

  const totalPayment = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.totalPayment || 0),
    0
  );

  const totalDue = totalBill - totalPayment;

  // ==============================
  // CURRENCY FORMAT
  // ==============================

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // ==============================
  // SUMMARY CARDS
  // ==============================

  const summaryCards = [
    {
      title: "Total Customers",
      value: loading
        ? "..."
        : totalCustomers.toLocaleString("en-IN"),
      description: "Registered customers",
      icon: Users,
      iconColor: "text-purple-700",
      iconBg: "bg-purple-100",
      borderColor: "border-purple-100",
    },
    {
      title: "Total Bills",
      value: loading ? "..." : formatCurrency(totalBill),
      description: "Total sales amount",
      icon: Receipt,
      iconColor: "text-blue-700",
      iconBg: "bg-blue-100",
      borderColor: "border-blue-100",
    },
    {
      title: "Payments Received",
      value: loading ? "..." : formatCurrency(totalPayment),
      description: "Total amount received",
      icon: Wallet,
      iconColor: "text-green-700",
      iconBg: "bg-green-100",
      borderColor: "border-green-100",
    },
    {
      title: "Total Due",
      value: loading ? "..." : formatCurrency(totalDue),
      description: "Remaining receivable",
      icon: IndianRupee,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      borderColor: "border-red-100",
    },
  ];

  // ==============================
  // UI
  // ==============================

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF8FF] md:flex-row">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="min-w-0 w-full flex-1 p-4 sm:p-5 md:p-7 lg:p-8">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-[1600px]"
        >

          {/* ==============================
              HEADER
          ============================== */}

          <motion.header
            variants={itemVariants}
            className="mb-7 flex flex-col gap-5 sm:mb-9 lg:flex-row lg:items-start lg:justify-between"
          >

            {/* TITLE */}
            <div className="min-w-0">

              <div className="mb-2 flex items-center gap-2">
                <Flower2
                  size={17}
                  className="text-purple-600"
                />

                <p className="text-sm font-semibold text-purple-600">
                  Welcome to your business
                </p>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-gray-800 sm:text-3xl lg:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Manage your flower business easily.
              </p>

              {/* DATE AND TIME */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* DATE */}
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-purple-100 bg-white px-4 py-3 shadow-sm">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <CalendarDays size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      Current Date
                    </p>

                    <p className="break-words text-sm font-semibold text-gray-800">
                      {indianDate}
                    </p>
                  </div>

                </div>

                {/* TIME */}
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-sm">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Clock size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      Current Time (IST)
                    </p>

                    <p className="break-words text-sm font-semibold tabular-nums text-gray-800">
                      {indianTime}
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* PROFILE AND NOTIFICATION */}
            <div className="flex items-center justify-between gap-3 sm:justify-end">

              <button
                type="button"
                aria-label="Notifications"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 shadow-sm transition hover:bg-purple-50"
              >
                <Bell size={20} />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700 font-bold text-white shadow-md">
                GB
              </div>

            </div>

          </motion.header>

          {/* ==============================
              ERROR MESSAGE
          ============================== */}

          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
            >

              <p className="break-words">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchCustomers}
                className="w-fit font-bold underline"
              >
                Retry
              </button>

            </motion.div>
          )}

          {/* ==============================
              BUSINESS OVERVIEW
          ============================== */}

          <motion.section variants={itemVariants}>

            <div className="mb-5 sm:mb-6">

              <div className="flex items-center gap-2">
                <TrendingUp
                  size={22}
                  className="text-purple-700"
                />

                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  Business Overview
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Complete financial summary of your flower business.
              </p>

            </div>

            {/* SUMMARY CARDS */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-5"
            >

              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <motion.div
                    key={card.title}
                    variants={itemVariants}
                    whileHover={{
                      y: -6,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`min-w-0 rounded-2xl border ${card.borderColor} bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-5 lg:p-6`}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-medium text-gray-500">
                          {card.title}
                        </p>

                        <h3 className="mt-3 break-words text-xl font-extrabold leading-snug text-gray-800 sm:text-2xl">
                          {card.value}
                        </h3>

                        <p className="mt-2 text-xs text-gray-400">
                          {card.description}
                        </p>

                      </div>

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${card.iconBg} ${card.iconColor}`}
                      >
                        <Icon size={25} />
                      </div>

                    </div>

                  </motion.div>
                );
              })}

            </motion.div>

          </motion.section>

          {/* ==============================
              WELCOME SECTION
          ============================== */}

          <motion.section
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="mt-7 overflow-hidden rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:mt-10 sm:p-7"
          >

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Flower2 size={27} />
              </div>

              <div className="min-w-0">

                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                  Welcome to Gouranga Florist
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Manage your customers, daily flower bills and payments
                  from the sidebar. Keep your business organized and
                  track your financial records easily.
                </p>

              </div>

            </div>

          </motion.section>

          {/* FOOTER */}
          <motion.footer
            variants={itemVariants}
            className="mt-8 pb-3 text-center text-xs text-gray-400"
          >
            © {new Date().getFullYear()} Gouranga Florist. All rights reserved.
          </motion.footer>

        </motion.div>

      </main>
    </div>
  );
};

export default Dashboard;
