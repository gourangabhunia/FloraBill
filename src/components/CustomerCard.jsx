
import { motion } from "framer-motion";
import {
  UserRound,
  ArrowUpRight,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerCard = ({ customer }) => {
  const navigate = useNavigate();

  const due = customer.totalBill - customer.totalPayment;

  const createdDate = customer.createdAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata"
      }).format(new Date(customer.createdAt))
    : "Recently added";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm"
    >
      <div className="flex justify-between items-center">

        <div className="bg-purple-100 p-4 rounded-2xl">
          <UserRound className="text-purple-700" size={30} />
        </div>

        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
          Active
        </span>

      </div>

      <h2 className="text-xl font-bold mt-5 text-gray-800">
        {customer.name}
      </h2>

      <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
        <CalendarDays size={14} />
        Added: {createdDate}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">

        <div className="bg-purple-50 p-3 rounded-xl">
          <p className="text-xs text-gray-500">Total Bill</p>
          <h3 className="font-bold mt-1">
            ₹{customer.totalBill.toLocaleString("en-IN")}
          </h3>
        </div>

        <div className="bg-green-50 p-3 rounded-xl">
          <p className="text-xs text-gray-500">Payment</p>
          <h3 className="font-bold mt-1 text-green-700">
            ₹{customer.totalPayment.toLocaleString("en-IN")}
          </h3>
        </div>

      </div>

      <div className="flex justify-between items-center mt-5">

        <div>
          <p className="text-xs text-gray-500">Remaining Due</p>
          <h3 className={`text-xl font-bold ${due > 0 ? "text-red-500" : "text-green-600"}`}>
            ₹{due.toLocaleString("en-IN")}
          </h3>
        </div>

        <button
          onClick={() =>
            navigate(`/customers/${customer.id}`, {
              state: { customer }
            })
          }
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded-xl text-sm transition"
        >
          View Profile
          <ArrowUpRight size={17} />
        </button>

      </div>
    </motion.div>
  );
};

export default CustomerCard;
