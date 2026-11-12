
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import CustomerCard from "../components/CustomerCard";

const API_URL = "https://florabill-backend.onrender.com/api/customers";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          data.message || "Unable to load customers"
        );
      }

      const formattedCustomers = (data.customers || []).map(
        (customer) => {
          const totalBill = Number(customer.totalBill || 0);
          const totalPayment = Number(customer.totalPayment || 0);

          return {
            ...customer,
            totalBill,
            totalPayment,
            totalDue: totalBill - totalPayment,
          };
        }
      );

      setCustomers(formattedCustomers);
    } catch (err) {
      console.error("Customer Fetch Error:", err);
      setError(err.message || "Unable to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ==============================
  // ADD CUSTOMER
  // ==============================

  const addCustomer = async (e) => {
    e.preventDefault();

    const name = newName.trim();

    if (!name) return;

    const alreadyExists = customers.some(
      (customer) =>
        customer.name?.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      alert("This customer already exists!");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to add customer"
        );
      }

      setNewName("");
      setShowForm(false);

      await fetchCustomers();
    } catch (err) {
      console.error("Add Customer Error:", err);
      setError(err.message || "Unable to save customer");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // SEARCH
  // ==============================

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ==============================
  // UI
  // ==============================

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF8FF] md:flex-row">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="min-w-0 w-full flex-1 p-4 sm:p-5 md:p-7 lg:p-8">

        <div className="mx-auto w-full max-w-[1600px]">

          {/* HEADER */}
          <motion.header
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-purple-600">
                Customer Management
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl">
                Customers
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Manage all your flower business customers.
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-800 sm:w-auto"
            >
              <Plus size={20} />
              Add Customer
            </motion.button>
          </motion.header>

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">
              <span className="break-words">{error}</span>

              <button
                type="button"
                onClick={fetchCustomers}
                className="w-fit font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* SUMMARY AND SEARCH */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-7 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* TOTAL CUSTOMERS */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Users size={24} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Customers
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-purple-700">
                    {customers.length}
                  </h2>
                </div>
              </div>

              {/* SEARCH */}
              <div className="relative w-full sm:max-w-md">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-purple-100 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

            </div>
          </motion.section>

          {/* CUSTOMER LIST HEADING */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              All Customers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredCustomers.length} customers found
            </p>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm">
              Loading customers...
            </div>
          ) : filteredCustomers.length > 0 ? (

            /* CUSTOMER CARDS */
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
            >
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35 },
                    },
                  }}
                  className="min-w-0"
                >
                  <CustomerCard customer={customer} />
                </motion.div>
              ))}
            </motion.div>

          ) : (

            /* EMPTY STATE */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-purple-100 bg-white px-5 py-16 text-center shadow-sm"
            >
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                <Users size={38} className="text-purple-700" />
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                {search ? "No Customer Found" : "No Customers Yet"}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try searching with another customer name."
                  : "Add your first customer to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white transition hover:bg-purple-800"
                >
                  <Plus size={19} />
                  Add Your First Customer
                </button>
              )}
            </motion.div>
          )}

          {/* ADD CUSTOMER MODAL */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-5"
                onClick={() => !saving && setShowForm(false)}
              >
                <motion.form
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={addCustomer}
                  onClick={(e) => e.stopPropagation()}
                  className="my-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
                >
                  {/* MODAL HEADER */}
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-gray-800">
                        Add New Customer
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Create a customer profile.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setShowForm(false)}
                      className="shrink-0 rounded-lg bg-gray-100 p-2 transition hover:bg-gray-200 disabled:opacity-50"
                      aria-label="Close form"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* CUSTOMER NAME */}
                  <label
                    htmlFor="customer-name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Customer Name
                  </label>

                  <input
                    id="customer-name"
                    autoFocus
                    type="text"
                    placeholder="Enter customer name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    required
                  />

                  {/* MODAL BUTTONS */}
                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setShowForm(false)}
                      className="rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Customer"}
                    </button>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
};

export default Customers;
