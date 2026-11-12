
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeft,
  Wallet,
  Receipt,
  IndianRupee,
  Plus,
  X,
  Trash2,
  CalendarDays,
  Clock,
  Flower2,
  LoaderCircle,
} from "lucide-react";

const API = "http://https://florabill-backend.onrender.com/api";

// ============================================
// DATE AND CURRENCY HELPERS
// ============================================

function getTodayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDate(date) {
  if (!date) return "-";

  const value = String(date).slice(0, 10);
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function currency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

// ============================================
// CUSTOMER PROFILE
// ============================================

function CustomerProfile() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deletingBillId, setDeletingBillId] = useState(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);

  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Bill form
  const [billDate, setBillDate] = useState(getTodayIST());
  const [billItems, setBillItems] = useState([
    { flowerName: "", quantity: "", rate: "" },
  ]);

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayIST());
  const [paymentNote, setPaymentNote] = useState("");

  // ============================================
  // LOAD CUSTOMER DATA
  // ============================================

  const loadCustomerData = useCallback(async () => {
    try {
      setError("");

      const [
        customerResponse,
        billsResponse,
        paymentsResponse,
      ] = await Promise.all([
        fetch(`${API}/customers/${id}`),
        fetch(`${API}/customers/${id}/bills`),
        fetch(`${API}/customers/${id}/payments`),
      ]);

      const customerData = await customerResponse.json();
      const billsData = await billsResponse.json();
      const paymentsData = await paymentsResponse.json();

      if (!customerResponse.ok || !customerData.success) {
        throw new Error(
          customerData.message || "Unable to load customer"
        );
      }

      if (!billsResponse.ok || !billsData.success) {
        throw new Error(
          billsData.message || "Unable to load bills"
        );
      }

      if (!paymentsResponse.ok || !paymentsData.success) {
        throw new Error(
          paymentsData.message || "Unable to load payments"
        );
      }

      setCustomer(customerData.customer);
      setBills(billsData.bills || []);
      setPayments(paymentsData.payments || []);
    } catch (err) {
      console.error("Customer Profile Error:", err);
      setError(err.message || "Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // ============================================
  // BILL CALCULATION
  // ============================================

  const billTotal = billItems.reduce((total, item) => {
    return (
      total +
      Number(item.quantity || 0) * Number(item.rate || 0)
    );
  }, 0);

  const addBillItem = () => {
    setBillItems((previous) => [
      ...previous,
      { flowerName: "", quantity: "", rate: "" },
    ]);
  };

  const updateBillItem = (index, field, value) => {
    setBillItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeBillItem = (index) => {
    setBillItems((previous) =>
      previous.length === 1
        ? previous
        : previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // ============================================
  // ADD DAILY BILL
  // ============================================

  const handleAddBill = async (e) => {
    e.preventDefault();

    const validItems = billItems.every(
      (item) =>
        item.flowerName.trim() &&
        item.quantity !== "" &&
        Number.isFinite(Number(item.quantity)) &&
        Number(item.quantity) > 0 &&
        item.rate !== "" &&
        Number.isFinite(Number(item.rate)) &&
        Number(item.rate) >= 0
    );

    if (!validItems) {
      alert("Please enter valid flower details.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/customers/${id}/bills`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            billDate,
            items: billItems.map((item) => ({
              flowerName: item.flowerName.trim(),
              quantity: Number(item.quantity),
              rate: Number(item.rate),
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save bill");
      }

      setShowBillModal(false);
      setBillDate(getTodayIST());
      setBillItems([
        { flowerName: "", quantity: "", rate: "" },
      ]);

      await loadCustomerData();
      alert("Daily bill saved successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE DAILY BILL
  // ============================================

  const handleDeleteBill = async (billId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bill? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingBillId(billId);

      const response = await fetch(
        `${API}/customers/${id}/bills/${billId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete bill");
      }

      await loadCustomerData();
      alert("Bill deleted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingBillId(null);
    }
  };

  // ============================================
  // ADD CUSTOMER PAYMENT
  // ============================================

  const handleAddPayment = async (e) => {
    e.preventDefault();

    if (
      paymentAmount === "" ||
      !Number.isFinite(Number(paymentAmount)) ||
      Number(paymentAmount) <= 0
    ) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/customers/${id}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(paymentAmount),
            paymentDate,
            note: paymentNote,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save payment"
        );
      }

      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentDate(getTodayIST());
      setPaymentNote("");

      await loadCustomerData();
      alert("Payment saved successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE CUSTOMER PAYMENT
  // ============================================

  const handleDeletePayment = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?\n\nDeleting it will increase the customer's remaining due."
    );

    if (!confirmed) return;

    try {
      setDeletingPaymentId(paymentId);

      const response = await fetch(
        `${API}/customers/${id}/payments/${paymentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete payment"
        );
      }

      // Reload customer totals and payment history
      await loadCustomerData();

      alert("Payment deleted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingPaymentId(null);
    }
  };

  // ============================================
  // LOADING AND ERROR STATES
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
        <LoaderCircle
          className="animate-spin text-purple-600"
          size={36}
        />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8ff] p-6">
        <p className="text-red-600 mb-4">
          {error || "Customer not found"}
        </p>

        <Link
          to="/"
          className="bg-purple-600 text-white px-5 py-2 rounded-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // ============================================
  // ACCOUNT CALCULATION
  // ============================================

  const totalBill = Number(customer.totalBill || 0);
  const totalPayment = Number(customer.totalPayment || 0);
  const totalDue = totalBill - totalPayment;

  // ============================================
  // DOWNLOAD INDIVIDUAL BILL PDF
  // ============================================

  const downloadBillPDF = (bill) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const purple = [124, 58, 237];
    const dark = [35, 35, 45];
    const gray = [110, 110, 120];

    // Header
    doc.setFillColor(...purple);
    doc.rect(0, 0, pageWidth, 43, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.text("GOURANGA FLORIST", 15, 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("FLOWER BILL / INVOICE", 15, 29);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ORIGINAL BILL", pageWidth - 15, 19, {
      align: "right",
    });

    // Customer details
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("BILL DETAILS", 15, 57);

    doc.setDrawColor(220, 220, 230);
    doc.line(15, 61, pageWidth - 15, 61);

    doc.setFillColor(248, 246, 255);
    doc.roundedRect(15, 68, pageWidth - 30, 28, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text("CUSTOMER NAME", 21, 77);
    doc.text("BILL NUMBER", 112, 77);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);

    doc.text(String(customer.name), 21, 87);
    doc.text(`#${bill.id}`, 112, 87);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Bill Date:", 15, 108);

    doc.setFont("helvetica", "normal");
    doc.text(formatDate(bill.billDate), 39, 108);

    // Flower table
    const rows = (bill.items || []).map((item) => [
      String(item.flowerName || ""),
      String(item.quantity),
      `Rs. ${Number(item.rate || 0).toFixed(2)}`,
      `Rs. ${Number(item.amount || 0).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 118,
      head: [[
        "FLOWER NAME",
        "QUANTITY",
        "RATE",
        "AMOUNT",
      ]],
      body: rows,
      theme: "grid",
      margin: {
        left: 15,
        right: 15,
        bottom: 25,
      },
      headStyles: {
        fillColor: purple,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        cellPadding: 5,
      },
      bodyStyles: {
        textColor: dark,
        fontStyle: "bold",
        fontSize: 10,
        cellPadding: 6,
        lineColor: [225, 225, 235],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [248, 247, 252],
      },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right", fontStyle: "bold" },
      },
      styles: {
        overflow: "linebreak",
        valign: "middle",
      },
    });

    // Total amount
    let totalY = doc.lastAutoTable.finalY + 12;

    if (totalY > pageHeight - 55) {
      doc.addPage();
      totalY = 25;
    }

    doc.setFillColor(248, 246, 255);
    doc.roundedRect(
      15,
      totalY,
      pageWidth - 30,
      24,
      3,
      3,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text("TOTAL BILL AMOUNT", 22, totalY + 15);

    doc.setTextColor(...purple);
    doc.setFontSize(16);
    doc.text(
      `Rs. ${Number(bill.totalAmount || 0).toFixed(2)}`,
      pageWidth - 22,
      totalY + 15,
      { align: "right" }
    );

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setDrawColor(220, 220, 230);
      doc.line(
        15,
        pageHeight - 18,
        pageWidth - 15,
        pageHeight - 18
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...gray);

      doc.text(
        `Gouranga Florist | Page ${page} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    const safeName = customer.name.replace(
      /[^a-z0-9-_]/gi,
      "_"
    );

    doc.save(`Bill_${safeName}_${bill.id}.pdf`);
  };

  // ============================================
  // DOWNLOAD FULL CUSTOMER STATEMENT PDF
  // ============================================

  const downloadStatementPDF = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, pageWidth, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("GOURANGA FLORIST", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("CUSTOMER ACCOUNT STATEMENT", 14, 28);

    doc.setTextColor(35, 35, 45);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Customer: ${customer.name}`, 14, 51);
    doc.text(`Customer ID: #${customer.id}`, 14, 59);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Statement Date: ${formatDateTime(new Date())}`,
      14,
      67
    );

    const rows = [];

    bills.forEach((bill) => {
      (bill.items || []).forEach((item) => {
        rows.push([
          `#${bill.id}`,
          formatDate(bill.billDate),
          String(item.flowerName || ""),
          String(item.quantity),
          `Rs. ${Number(item.rate || 0).toFixed(2)}`,
          `Rs. ${Number(item.amount || 0).toFixed(2)}`,
        ]);
      });
    });

    autoTable(doc, {
      startY: 76,
      head: [[
        "Bill No.",
        "Date",
        "Flower",
        "Qty",
        "Rate",
        "Amount",
      ]],
      body: rows.length
        ? rows
        : [["-", "-", "No bills recorded", "-", "-", "-"]],
      theme: "grid",
      margin: {
        left: 14,
        right: 14,
        bottom: 25,
      },
      headStyles: {
        fillColor: [124, 58, 237],
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
      },
      styles: {
        overflow: "linebreak",
      },
    });

    let summaryY = doc.lastAutoTable.finalY + 10;

    if (summaryY > pageHeight - 65) {
      doc.addPage();
      summaryY = 25;
    }

    autoTable(doc, {
      startY: summaryY,
      body: [
        ["TOTAL BILLS", `Rs. ${totalBill.toFixed(2)}`],
        [
          "PAYMENT RECEIVED",
          `Rs. ${totalPayment.toFixed(2)}`,
        ],
        ["REMAINING DUE", `Rs. ${totalDue.toFixed(2)}`],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        fontStyle: "bold",
        cellPadding: 5,
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right" },
      },
    });

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setDrawColor(220, 220, 230);
      doc.line(
        14,
        pageHeight - 18,
        pageWidth - 14,
        pageHeight - 18
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 120);

      doc.text(
        `Gouranga Florist | Page ${page} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    const safeName = customer.name.replace(
      /[^a-z0-9-_]/gi,
      "_"
    );

    doc.save(`Statement_${safeName}.pdf`);
  };

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <div className="min-h-screen bg-[#faf8ff] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-purple-600 font-medium">
              Customer Profile
            </p>

            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              {customer.name}
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Customer ID: #{customer.id}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Added: {formatDateTime(customer.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowBillModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-medium"
            >
              <Plus size={18} />
              Add Daily Bill
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium"
            >
              <Plus size={18} />
              Add Payment
            </button>

            <button
              onClick={downloadStatementPDF}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-3 rounded-xl font-medium"
            >
              <Receipt size={18} />
              Download Statement
            </button>
          </div>
        </div>

        {/* ACCOUNT SUMMARY */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <SummaryCard
            title="Total Bills"
            amount={totalBill}
            icon={<Receipt size={24} />}
            color="purple"
          />

          <SummaryCard
            title="Payment Received"
            amount={totalPayment}
            icon={<Wallet size={24} />}
            color="green"
          />

          <SummaryCard
            title="Remaining Due"
            amount={totalDue}
            icon={<IndianRupee size={24} />}
            color="orange"
          />
        </div>

        {/* DAILY FLOWER BILLS */}

        <section className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 md:p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Receipt className="text-purple-600" size={25} />

            <h2 className="text-xl font-bold text-gray-900">
              Daily Flower Bills
            </h2>
          </div>

          {bills.length === 0 ? (
            <EmptyState
              icon={<Flower2 size={35} />}
              title="No Bills Yet"
              description="Customer daily bills will appear here."
            />
          ) : (
            <div className="space-y-5">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex flex-wrap justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Bill #{bill.id}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        <CalendarDays
                          size={14}
                          className="inline mr-1"
                        />
                        {formatDate(bill.billDate)}
                      </p>

                      {bill.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          <Clock
                            size={12}
                            className="inline mr-1"
                          />
                          Created: {formatDateTime(bill.createdAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-bold text-purple-700 text-lg">
                        {currency(bill.totalAmount)}
                      </p>

                      <button
                        type="button"
                        onClick={() => downloadBillPDF(bill)}
                        className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        <Receipt size={16} />
                        PDF
                      </button>

                      <button
                        type="button"
                        disabled={deletingBillId === bill.id}
                        onClick={() => handleDeleteBill(bill.id)}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {deletingBillId === bill.id ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* FLOWER TABLE */}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-purple-50 text-gray-600">
                        <tr>
                          <th className="p-3">Flower</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Rate</th>
                          <th className="p-3">Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(bill.items || []).map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100"
                          >
                            <td className="p-3">
                              {item.flowerName}
                            </td>

                            <td className="p-3">
                              {item.quantity}
                            </td>

                            <td className="p-3">
                              {currency(item.rate)}
                            </td>

                            <td className="p-3 font-medium">
                              {currency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PAYMENT HISTORY */}

        <section className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Wallet className="text-green-600" size={25} />

              <h2 className="text-xl font-bold text-gray-900">
                Payment History
              </h2>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center justify-center gap-2 text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={17} />
              Add Payment
            </button>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={<Wallet size={35} />}
              title="No Payments Yet"
              description="Customer payments will appear here."
            />
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 rounded-xl p-4 hover:bg-green-50/40"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      Payment #{payment.id}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      <CalendarDays
                        size={14}
                        className="inline mr-1"
                      />
                      {formatDate(payment.paymentDate)}
                    </p>

                    {payment.note && (
                      <p className="text-sm text-gray-500 mt-1">
                        Note: {payment.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-green-700 font-bold text-lg">
                      + {currency(payment.amount)}
                    </p>

                    <button
                      type="button"
                      disabled={deletingPaymentId === payment.id}
                      onClick={() =>
                        handleDeletePayment(payment.id)
                      }
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      title="Delete Payment"
                    >
                      {deletingPaymentId === payment.id ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =====================================
          ADD BILL MODAL
      ===================================== */}

      {showBillModal && (
        <Modal
          title="Add Daily Flower Bill"
          onClose={() => setShowBillModal(false)}
        >
          <form onSubmit={handleAddBill} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Bill Date
              </label>

              <input
                type="date"
                required
                max={getTodayIST()}
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div className="space-y-4">
              {billItems.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-700">
                      Flower {index + 1}
                    </p>

                    {billItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBillItem(index)}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Flower Name"
                    required
                    value={item.flowerName}
                    onChange={(e) =>
                      updateBillItem(
                        index,
                        "flowerName",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-lg p-3"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Quantity"
                      min="0.01"
                      step="any"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        updateBillItem(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-3"
                    />

                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      min="0"
                      step="0.01"
                      required
                      value={item.rate}
                      onChange={(e) =>
                        updateBillItem(
                          index,
                          "rate",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-3"
                    />
                  </div>

                  <p className="text-right font-semibold text-purple-700">
                    Amount:{" "}
                    {currency(
                      Number(item.quantity || 0) *
                      Number(item.rate || 0)
                    )}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addBillItem}
              className="text-purple-700 font-medium flex items-center gap-2"
            >
              <Plus size={17} />
              Add Another Flower
            </button>

            <div className="bg-purple-50 rounded-xl p-4 flex justify-between">
              <span className="font-semibold">
                Total Bill
              </span>

              <span className="font-bold text-purple-700 text-xl">
                {currency(billTotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Daily Bill"}
            </button>
          </form>
        </Modal>
      )}

      {/* =====================================
          ADD PAYMENT MODAL
      ===================================== */}

      {showPaymentModal && (
        <Modal
          title="Add Customer Payment"
          onClose={() => setShowPaymentModal(false)}
        >
          <form onSubmit={handleAddPayment} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Amount (₹)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(e.target.value)
                }
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Date
              </label>

              <input
                type="date"
                required
                max={getTodayIST()}
                value={paymentDate}
                onChange={(e) =>
                  setPaymentDate(e.target.value)
                }
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Note (Optional)
              </label>

              <input
                type="text"
                placeholder="Cash, UPI, Bank transfer..."
                value={paymentNote}
                onChange={(e) =>
                  setPaymentNote(e.target.value)
                }
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                Current Remaining Due
              </p>

              <p className="text-xl font-bold text-orange-600 mt-1">
                {currency(totalDue)}
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Payment"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ============================================
// SUMMARY CARD
// ============================================

function SummaryCard({ title, amount, icon, color }) {
  const styles = {
    purple: "bg-purple-50 text-purple-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 font-medium">
          {title}
        </p>

        <div className={`p-3 rounded-xl ${styles[color]}`}>
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900">
        {currency(amount)}
      </h3>
    </motion.div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ icon, title, description }) {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="text-green-400 mb-4">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-gray-800">
        {title}
      </h3>

      <p className="text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
}

// ============================================
// MODAL
// ============================================

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 md:p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={21} />
          </button>
        </div>

        {children}
      </motion.div>
    </div>
  );
}

export default CustomerProfile;
