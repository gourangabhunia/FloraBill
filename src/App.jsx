
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  Users,
  Sprout,
  UserRound,
  ReceiptText,
  Wallet,
  Scale,
  ArrowRight,
  Flower2,
  Leaf,
  Sparkles,
} from "lucide-react";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerRecords from "./pages/CustomerRecords";
import Farmers from "./pages/Farmers";
import FarmerProfile from "./pages/FarmerProfile";

// Common Popup System
import { FeedbackProvider } from "./components/FeedbackProvider";

// =====================================
// HOME PAGE
// =====================================

function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <div className="flower-decoration flower-top-left">✿</div>
      <div className="flower-decoration flower-top-right">❀</div>
      <div className="flower-decoration flower-bottom-left">✿</div>
      <div className="flower-decoration flower-bottom-right">❀</div>

      <div className="home-container">

        {/* BRAND HEADER */}
        <motion.header
          className="brand-header"
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="brand-icon">
            <Flower2 size={35} />
          </div>

          <h1>
            Gouranga <span>Florist</span>
          </h1>

          <div className="brand-subtitle">
            <span></span>
            Business Management System
            <span></span>
          </div>

          <div className="welcome-pill">
            <Sparkles size={17} />
            Manage Your Flower Business
            <Sparkles size={17} />
          </div>
        </motion.header>

        {/* MANAGEMENT CARDS */}
        <section className="management-grid">

          {/* CUSTOMER CARD */}
          <motion.div
            className="management-card customer-card"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <div className="card-decoration customer-decoration">
              <Flower2 size={130} />
            </div>

            <div className="card-heading">
              <div className="card-main-icon customer-icon">
                <Users size={36} />
              </div>

              <div>
                <h2>Customer</h2>
                <p>Flower Sales Management</p>
              </div>
            </div>

            <div className="card-features">
              <div className="feature-item">
                <UserRound size={21} />
                <span>Customer Profiles</span>
              </div>

              <div className="feature-item">
                <ReceiptText size={21} />
                <span>Daily Bills</span>
              </div>

              <div className="feature-item">
                <Wallet size={21} />
                <span>Payment History</span>
              </div>

              <div className="feature-item">
                <Scale size={21} />
                <span>Remaining Due (Receivable)</span>
              </div>
            </div>

            <button
              type="button"
              className="open-button customer-button"
              onClick={() => navigate("/customers")}
            >
              Open Customers
              <ArrowRight size={21} />
            </button>
          </motion.div>

          {/* FARMER CARD */}
          <motion.div
            className="management-card farmer-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            whileHover={{ y: -8 }}
          >
            <div className="card-decoration farmer-decoration">
              <Sprout size={135} />
            </div>

            <div className="card-heading">
              <div className="card-main-icon farmer-icon">
                <Sprout size={39} />
              </div>

              <div>
                <h2>Farmer</h2>
                <p>Flower Purchase Management</p>
              </div>
            </div>

            <div className="card-features">
              <div className="feature-item">
                <UserRound size={21} />
                <span>Farmer Profiles</span>
              </div>

              <div className="feature-item">
                <Flower2 size={21} />
                <span>Daily Purchases</span>
              </div>

              <div className="feature-item">
                <Wallet size={21} />
                <span>Payment History</span>
              </div>

              <div className="feature-item">
                <Scale size={21} />
                <span>Remaining Payable (Our Due)</span>
              </div>
            </div>

            <button
              type="button"
              className="open-button farmer-button"
              onClick={() => navigate("/farmers")}
            >
              Open Farmers
              <ArrowRight size={21} />
            </button>
          </motion.div>

        </section>

        {/* FOOTER */}
        <footer className="home-footer">
          <Leaf size={16} />
          <span>Growing Your Business With Care</span>
          <Leaf size={16} />
        </footer>

      </div>
    </main>
  );
}

// =====================================
// MAIN APP
// =====================================

function App() {
  return (
    <BrowserRouter>
      <FeedbackProvider>
        <Routes>

          {/* HOME */}
          <Route
            path="/"
            element={<HomePage />}
          />

          {/* CUSTOMER SYSTEM */}
          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/customers/:id"
            element={<CustomerProfile />}
          />

          <Route
            path="/bills"
            element={<CustomerRecords mode="bills" />}
          />

          <Route
            path="/payments"
            element={<CustomerRecords mode="payments" />}
          />

          {/* FARMER SYSTEM */}
          <Route
            path="/farmers"
            element={<Farmers />}
          />

          <Route
            path="/farmers/:id"
            element={<FarmerProfile />}
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

        </Routes>
      </FeedbackProvider>
    </BrowserRouter>
  );
}

export default App;
