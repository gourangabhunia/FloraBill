
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Search,
  Users,
  Receipt,
  Wallet,
  ChevronRight,
  LoaderCircle,
  IndianRupee,
  ArrowUpRight,
  X,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const API_URL = "http://https://florabill-backend.onrender.com/api/customers";

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

function CustomerRecords({ mode }) {
  const navigate = useNavigate();

  const isBillsPage = mode === "bills";

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // FETCH CUSTOMERS
  // ==============================

  const fetchCustomers = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load customers"
        );
      }

      setCustomers(
        (data.customers || []).map((customer) => ({
          ...customer,
          totalBill: Number(customer.totalBill || 0),
          totalPayment: Number(customer.totalPayment || 0),
        }))
      );
    } catch (err) {
      console.error("Customer Records Error:", err);

      setError(
        err.message || "Unable to load customer records"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ==============================
  // FORMAT CURRENCY
  // ==============================

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // ==============================
  // SEARCH CUSTOMERS
  // ==============================

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ==============================
  // TOTAL AMOUNT
  // ==============================

  const totalAmount = customers.reduce(
    (sum, customer) =>
      sum +
      (isBillsPage
        ? customer.totalBill
        : customer.totalPayment),
    0
  );

  // ==============================
  // PAGE CONTENT
  // ==============================

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF8FF] md:flex-row">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="min-w-0 w-full flex-1 p-4 sm:p-5 md:p-7 lg:p-8">

        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-[1600px]"
        >

          {/* ==============================
              HEADER
          ============================== */}

          <motion.header
            variants={cardVariants}
            className="mb-7 sm:mb-9"
          >
            <div className="flex items-start gap-3">

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${
                  isBillsPage
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {isBillsPage ? (
                  <Receipt size={26} />
                ) : (
                  <Wallet size={26} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-purple-600">
                  Business Management
                </p>

                <h1 className="mt-1 break-words text-2xl font-extrabold text-gray-800 sm:text-3xl lg:text-4xl">
                  {isBillsPage ? "Bills" : "Payments"}
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:text-base">
                  {isBillsPage
                    ? "Select a customer to view all their daily flower bills."
                    : "Select a customer to view their complete payment history."}
                </p>
              </div>

            </div>
          </motion.header>

          {/* ==============================
              SUMMARY CARDS
          ============================== */}

          <motion.section
            variants={cardVariants}
            className="mb-7 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5"
          >

            {/* TOTAL CUSTOMERS */}

            <motion.div
              whileHover={{ y: -4 }}
              className="min-w-0 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Total Customers
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold text-gray-800">
                    {customers.length}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Registered customers
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 sm:h-14 sm:w-14">
                  <Users size={25} />
                </div>

              </div>
            </motion.div>

            {/* TOTAL BILL / PAYMENT */}

            <motion.div
              whileHover={{ y: -4 }}
              className="min-w-0 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">
                    {isBillsPage
                      ? "Total Bill Amount"
                      : "Total Payments Received"}
                  </p>

                  <h2 className="mt-2 break-words text-xl font-extrabold text-gray-800 sm:text-2xl">
                    {formatCurrency(totalAmount)}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    {isBillsPage
                      ? "Total sales amount"
                      : "Total amount collected"}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${
                    isBillsPage
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isBillsPage ? (
                    <IndianRupee size={25} />
                  ) : (
                    <Wallet size={25} />
                  )}
                </div>

              </div>
            </motion.div>

          </motion.section>

          {/* ==============================
              CUSTOMER RECORDS
          ============================== */}

          <motion.section
            variants={cardVariants}
            className="min-w-0 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:p-6"
          >

            {/* SECTION HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-800">
                  All Customers
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select a customer to view their complete records.
                </p>

                <p className="mt-2 text-xs font-medium text-purple-600">
                  {filteredCustomers.length} customers found
                </p>
              </div>

              {/* SEARCH */}

              <div className="relative w-full sm:max-w-sm">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-purple-100 bg-white py-3 pl-12 pr-11 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">

                <p className="break-words">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchCustomers}
                  className="flex w-fit items-center gap-2 font-semibold underline"
                >
                  <RefreshCw size={15} />
                  Retry
                </button>

              </div>
            )}

            {/* LOADING */}

            {loading ? (

              <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-purple-600">
                <LoaderCircle
                  size={32}
                  className="animate-spin"
                />

                <p className="text-sm text-gray-500">
                  Loading {isBillsPage ? "bills" : "payments"}...
                </p>
              </div>

            ) : filteredCustomers.length > 0 ? (

              /* CUSTOMER CARDS */

              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.07 },
                  },
                }}
                initial="hidden"
                animate="visible"
                className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2"
              >

                {filteredCustomers.map((customer) => {

                  const amount = isBillsPage
                    ? customer.totalBill
                    : customer.totalPayment;

                  return (
                    <motion.button
                      type="button"
                      key={customer.id}
                      variants={cardVariants}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() =>
                        navigate(`/customers/${customer.id}`)
                      }
                      className="group min-w-0 w-full rounded-2xl border border-purple-100 p-4 text-left transition-colors duration-200 hover:border-purple-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300 sm:p-5"
                    >

                      {/* CUSTOMER INFORMATION */}

                      <div className="flex min-w-0 items-center gap-3">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            isBillsPage
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isBillsPage ? (
                            <Receipt size={23} />
                          ) : (
                            <Wallet size={23} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-base font-bold text-gray-800 sm:text-lg">
                            {customer.name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            Customer ID: #{customer.id}
                          </p>
                        </div>

                        <ChevronRight
                          size={22}
                          className="shrink-0 text-purple-600 transition-transform group-hover:translate-x-1"
                        />

                      </div>

                      {/* AMOUNT INFORMATION */}

                      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">
                            {isBillsPage
                              ? "Total Bill Amount"
                              : "Total Received"}
                          </p>

                          <p
                            className={`mt-1 break-words text-xl font-extrabold sm:text-2xl ${
                              isBillsPage
                                ? "text-purple-700"
                                : "text-green-700"
                            }`}
                          >
                            {formatCurrency(amount)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                          <span>View Records</span>
                          <ArrowUpRight size={17} />
                        </div>

                      </div>

                    </motion.button>
                  );
                })}

              </motion.div>

            ) : (

              /* EMPTY STATE */

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center"
              >

                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                  <Users
                    size={40}
                    className="text-purple-500"
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-800">
                  {search
                    ? "No Customer Found"
                    : "No Customers Yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  {search
                    ? "Try another customer name."
                    : "Add customers first to see their records here."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl bg-purple-100 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-200"
                  >
                    Clear Search
                  </button>
                )}

              </motion.div>

            )}

          </motion.section>

          {/* FOOTER */}

          <footer className="mt-8 pb-3 text-center text-xs text-gray-400">
            Gouranga Florist · {isBillsPage ? "Bills Management" : "Payments Management"}
          </footer>

        </motion.div>
      </main>
    </div>
  );
}

export default CustomerRecords;
