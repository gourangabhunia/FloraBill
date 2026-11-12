
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useFeedback } from "../components/FeedbackProvider";

import {
  ArrowLeft,
  Phone,
  MapPin,
  CalendarDays,
  Flower2,
  Wallet,
  ReceiptText,
  Plus,
  Trash2,
  X,
  Printer,
  RefreshCw,
  Pencil,
} from "lucide-react";

const API_URL = "http://https://florabill-backend.onrender.com/api/farmers";

// =====================================
// HELPER FUNCTIONS
// =====================================

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyFlower = () => ({
  flowerName: "",
  quantity: "",
  unit: "kg",
  rate: "",
});

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// =====================================
// MAIN FARMER PROFILE
// =====================================

export default function FarmerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify, confirmAction } = useFeedback();

  const [farmer, setFarmer] = useState(null);

  const [summary, setSummary] = useState({
    totalPurchase: 0,
    totalPayment: 0,
    remainingDue: 0,
  });

  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);

  const [purchaseData, setPurchaseData] = useState({
    purchaseDate: today(),
    note: "",
    items: [emptyFlower()],
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: today(),
    paymentMode: "Cash",
    note: "",
  });

  // =====================================
  // LOAD FARMER PROFILE
  // =====================================

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, purchaseResponse, paymentResponse] =
        await Promise.all([
          fetch(`${API_URL}/${id}`),
          fetch(`${API_URL}/${id}/purchases`),
          fetch(`${API_URL}/${id}/payments`),
        ]);

      const [
        profileData,
        purchaseDataResult,
        paymentDataResult,
      ] = await Promise.all([
        profileResponse.json(),
        purchaseResponse.json(),
        paymentResponse.json(),
      ]);

      if (!profileResponse.ok || !profileData.success) {
        throw new Error(
          profileData.message || "Farmer profile not found"
        );
      }

      if (!purchaseResponse.ok || !purchaseDataResult.success) {
        throw new Error(
          purchaseDataResult.message ||
            "Unable to fetch purchase history"
        );
      }

      if (!paymentResponse.ok || !paymentDataResult.success) {
        throw new Error(
          paymentDataResult.message ||
            "Unable to fetch payment history"
        );
      }

      setFarmer(profileData.farmer);
      setSummary(profileData.summary);
      setPurchases(purchaseDataResult.purchases || []);
      setPayments(paymentDataResult.payments || []);
    } catch (err) {
      setError(err.message || "Unable to load farmer profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // =====================================
  // PURCHASE FORM HANDLERS
  // =====================================

  const resetPurchaseForm = () => {
    setEditingPurchaseId(null);
    setPurchaseData({
      purchaseDate: today(),
      note: "",
      items: [emptyFlower()],
    });
  };

  const openAddPurchaseForm = () => {
    resetPurchaseForm();
    setShowPurchaseForm(true);
  };

  const updateFlower = (index, field, value) => {
    setPurchaseData((previous) => ({
      ...previous,
      items: previous.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addFlowerRow = () => {
    setPurchaseData((previous) => ({
      ...previous,
      items: [...previous.items, emptyFlower()],
    }));
  };

  const removeFlowerRow = (index) => {
    setPurchaseData((previous) => ({
      ...previous,
      items:
        previous.items.length === 1
          ? previous.items
          : previous.items.filter((_, i) => i !== index),
    }));
  };

  const purchaseTotal = purchaseData.items.reduce((total, item) => {
    return (
      total +
      (Number(item.quantity) || 0) *
        (Number(item.rate) || 0)
    );
  }, 0);

  // =====================================
  // EDIT PURCHASE BILL
  // =====================================

  const handleEditPurchase = (purchase) => {
    setEditingPurchaseId(purchase.id);

    setPurchaseData({
      purchaseDate: String(purchase.purchaseDate).slice(0, 10),
      note: purchase.note || "",
      items: purchase.items.map((item) => ({
        flowerName: item.flowerName,
        quantity: String(item.quantity),
        unit: item.unit || "kg",
        rate: String(item.rate),
      })),
    });

    setShowPurchaseForm(true);
  };

  // =====================================
  // SAVE / UPDATE PURCHASE BILL
  // =====================================

  const savePurchase = async (e) => {
    e.preventDefault();

    const validItems = purchaseData.items.every(
      (item) =>
        item.flowerName.trim() &&
        Number.isFinite(Number(item.quantity)) &&
        Number(item.quantity) > 0 &&
        item.rate !== "" &&
        Number.isFinite(Number(item.rate)) &&
        Number(item.rate) >= 0
    );

    if (!validItems) {
      notify("Please enter valid details for every flower.", "error");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingPurchaseId);

      const url = isEditing
        ? `${API_URL}/${id}/purchases/${editingPurchaseId}`
        : `${API_URL}/${id}/purchases`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Purchase could not be saved"
        );
      }

      setShowPurchaseForm(false);
      resetPurchaseForm();
      await loadProfile();

      notify(
        isEditing
          ? "Purchase bill updated successfully!"
          : "Flower purchase saved successfully!",
        "success"
      );
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // DELETE PURCHASE BILL
  // =====================================

  const handleDeletePurchase = async (purchase) => {
    const confirmed = await confirmAction({
      title: "Delete Purchase Bill?",
      message: `Are you sure you want to delete Purchase Bill #${purchase.id}?`,
      details: "All flower items in this bill will also be deleted.",
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });

    if (!confirmed) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/${id}/purchases/${purchase.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete purchase bill"
        );
      }

      await loadProfile();
      notify("Purchase bill deleted successfully!", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // SAVE PAYMENT
  // =====================================

  const savePayment = async (e) => {
    e.preventDefault();

    const amount = Number(paymentData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      notify("Enter a valid payment amount.", "error");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/${id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Payment could not be saved"
        );
      }

      setShowPaymentForm(false);

      setPaymentData({
        amount: "",
        paymentDate: today(),
        paymentMode: "Cash",
        note: "",
      });

      await loadProfile();
      notify("Payment saved successfully!", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // DELETE PAYMENT
  // =====================================

  const handleDeletePayment = async (payment) => {
    const confirmed = await confirmAction({
      title: "Delete Payment?",
      message: `Are you sure you want to delete this payment of ${money(payment.amount)}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });

    if (!confirmed) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/${id}/payments/${payment.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete payment"
        );
      }

      await loadProfile();
      notify("Payment deleted successfully!", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // PDF HELPERS
  // =====================================

  const pdfDate = (value) => {
    if (!value) return "-";

    const datePart = String(value).slice(0, 10);
    const parts = datePart.split("-");

    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return datePart;
  };

  const safeFileName = (value) =>
    String(value || "Farmer")
      .trim()
      .replace(/[^a-z0-9-_]/gi, "_");

  const pdfMoney = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const pdfTableOptions = {
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [90, 90, 90],
      lineWidth: 0.15,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineColor: [40, 40, 40],
      lineWidth: 0.25,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    margin: {
      left: 14,
      right: 14,
    },
  };

  // =====================================
  // DAILY INVOICE PDF - DESIGN 2
  // =====================================

  const downloadDailyInvoicePDF = (purchase) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const right = pageWidth - 14;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("INVOICE", 14, 23);

    doc.setFontSize(14);
    doc.text("GOURANGA FLORIST", right, 20, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("FLOWER PURCHASE RECORD", right, 26, {
      align: "right",
    });

    doc.setDrawColor(25, 25, 25);
    doc.setLineWidth(0.5);
    doc.line(14, 33, right, 33);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("BILLED TO", 14, 43);
    doc.text("INVOICE DETAILS", 118, 43);

    doc.setFontSize(11);
    doc.text(String(farmer.name || "Farmer"), 14, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    if (farmer.phone) {
      doc.text(`Phone: ${farmer.phone}`, 14, 56);
    }

    if (farmer.village) {
      doc.text(
        `Village: ${farmer.village}`,
        14,
        farmer.phone ? 62 : 56
      );
    }

    doc.text(
      `Invoice No.: GF-${String(purchase.id).padStart(4, "0")}`,
      118,
      50
    );

    doc.text(
      `Date: ${pdfDate(purchase.purchaseDate)}`,
      118,
      56
    );

    doc.text(`Farmer ID: #${farmer.id}`, 118, 62);

    const rows = (purchase.items || []).map((item, index) => [
      String(index + 1),
      String(item.flowerName || "-"),
      `${Number(item.quantity || 0).toLocaleString("en-IN")} ${item.unit || ""}`.trim(),
      pdfMoney(item.rate),
      pdfMoney(item.amount),
    ]);

    autoTable(doc, {
      ...pdfTableOptions,
      startY: 73,
      head: [[
        "#",
        "Description",
        "Quantity",
        "Rate (Rs.)",
        "Amount (Rs.)",
      ]],
      body: rows.length
        ? rows
        : [["-", "No flower items", "-", "-", "-"]],
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 32, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 40, halign: "right" },
      },
    });

    let y = (doc.lastAutoTable?.finalY || 85) + 10;

    if (y > 245) {
      doc.addPage();
      y = 25;
    }

    doc.setDrawColor(30, 30, 30);
    doc.line(115, y, right, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL AMOUNT", 117, y + 8);

    doc.setFontSize(14);
    doc.text(
      pdfMoney(purchase.totalAmount),
      right,
      y + 8,
      { align: "right" }
    );

    if (purchase.note) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const noteLines = doc.splitTextToSize(
        `Note: ${purchase.note}`,
        180
      );

      doc.text(noteLines, 14, y + 23);
    }

    const footerY = Math.min(
      doc.internal.pageSize.getHeight() - 18,
      y + 45
    );

    doc.setDrawColor(150, 150, 150);
    doc.line(14, footerY - 7, right, footerY - 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      "Authorized Signature",
      right,
      footerY,
      { align: "right" }
    );

    doc.text(`Generated: ${pdfDate(today())}`, 14, footerY);

    doc.save(
      `Invoice_${safeFileName(farmer.name)}_${purchase.id}.pdf`
    );
  };

  // =====================================
  // FULL STATEMENT PDF - DESIGN 4
  // =====================================

  const downloadFullStatementPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const right = pageWidth - 14;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);

    doc.text(
      "GOURANGA FLORIST",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(11);
    doc.text(
      "STATEMENT OF ACCOUNT",
      pageWidth / 2,
      27,
      { align: "center" }
    );

    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.5);
    doc.line(14, 33, right, 33);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("FARMER DETAILS", 14, 42);

    doc.setFont("helvetica", "normal");
    doc.text(`Farmer: ${farmer.name || "-"}`, 14, 49);
    doc.text(`Farmer ID: #${farmer.id}`, 14, 55);
    doc.text(`Phone: ${farmer.phone || "-"}`, 14, 61);
    doc.text(`Village: ${farmer.village || "-"}`, 14, 67);

    doc.setFont("helvetica", "bold");
    doc.text("STATEMENT DETAILS", 118, 42);

    doc.setFont("helvetica", "normal");
    doc.text("Period: All Records", 118, 49);
    doc.text(`Generated: ${pdfDate(today())}`, 118, 55);

    // PURCHASE HISTORY
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("A. PURCHASE HISTORY", 14, 80);

    const purchaseRows = [...purchases]
      .sort((a, b) =>
        String(a.purchaseDate).localeCompare(String(b.purchaseDate)) ||
        Number(a.id) - Number(b.id)
      )
      .map((purchase) => {
        const itemNames = (purchase.items || [])
          .map((item) => item.flowerName)
          .filter(Boolean)
          .join(", ");

        return [
          `#${purchase.id}`,
          pdfDate(purchase.purchaseDate),
          itemNames || "-",
          pdfMoney(purchase.totalAmount),
        ];
      });

    autoTable(doc, {
      ...pdfTableOptions,
      startY: 84,
      head: [[
        "Bill No.",
        "Date",
        "Flower Details",
        "Bill Amount",
      ]],
      body: purchaseRows.length
        ? purchaseRows
        : [["-", "-", "No purchases recorded", pdfMoney(0)]],
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 30 },
        2: { cellWidth: 85 },
        3: { cellWidth: 35, halign: "right" },
      },
    });

    let nextY = (doc.lastAutoTable?.finalY || 95) + 10;

    if (nextY > 245) {
      doc.addPage();
      nextY = 20;
    }

    // PAYMENT HISTORY
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("B. PAYMENT HISTORY", 14, nextY);

    const paymentRows = [...payments]
      .sort((a, b) =>
        String(a.paymentDate).localeCompare(String(b.paymentDate)) ||
        Number(a.id) - Number(b.id)
      )
      .map((payment) => [
        pdfDate(payment.paymentDate),
        String(payment.paymentMode || "Not specified"),
        String(payment.note || "-"),
        pdfMoney(payment.amount),
      ]);

    autoTable(doc, {
      ...pdfTableOptions,
      startY: nextY + 4,
      head: [[
        "Payment Date",
        "Mode",
        "Particulars",
        "Amount",
      ]],
      body: paymentRows.length
        ? paymentRows
        : [["-", "-", "No payments recorded", pdfMoney(0)]],
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 35 },
        2: { cellWidth: 70 },
        3: { cellWidth: 35, halign: "right" },
      },
    });

    nextY = (doc.lastAutoTable?.finalY || nextY + 12) + 12;

    if (nextY > 245) {
      doc.addPage();
      nextY = 22;
    }

    // ACCOUNT SUMMARY
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("C. ACCOUNT SUMMARY", 14, nextY);

    autoTable(doc, {
      ...pdfTableOptions,
      startY: nextY + 4,
      body: [
        ["Total Purchase", pdfMoney(summary.totalPurchase)],
        ["Total Payment", pdfMoney(summary.totalPayment)],
        ["Remaining Payable", pdfMoney(summary.remainingDue)],
      ],
      styles: {
        font: "helvetica",
        fontSize: 10,
        textColor: [0, 0, 0],
        lineColor: [70, 70, 70],
        lineWidth: 0.2,
        cellPadding: 4,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 120 },
        1: { halign: "right" },
      },
      tableWidth: 180,
    });

    // PAGE NUMBERS
    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);

      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setDrawColor(160, 160, 160);
      doc.line(14, pageHeight - 15, right, pageHeight - 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.text(
        "Gouranga Florist - Farmer Account Statement",
        14,
        pageHeight - 9
      );

      doc.text(
        `Page ${page} of ${pageCount}`,
        right,
        pageHeight - 9,
        { align: "right" }
      );
    }

    doc.save(
      `Farmer_Statement_${safeFileName(farmer.name)}.pdf`
    );
  };

  // =====================================
  // PRINT REPORT
  // =====================================

  const handlePrint = () => {
    window.print();
  };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50 text-green-800">
        <RefreshCw className="mr-3 animate-spin" />
        Loading farmer profile...
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error || !farmer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-green-50 p-6">
        <p className="text-center text-red-600">
          {error || "Farmer not found"}
        </p>

        <button
          onClick={() => navigate("/farmers")}
          className="rounded-xl bg-green-700 px-5 py-3 text-white"
        >
          Back to Farmers
        </button>

        <button
          onClick={loadProfile}
          className="text-sm font-semibold text-green-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // =====================================
  // MAIN PROFILE PAGE
  // =====================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/farmers")}
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
            >
              <ArrowLeft size={18} />
              Back to Farmers
            </button>

            <p className="text-xs font-bold tracking-[3px] text-green-700">
              GOURANGA FLORIST
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Farmer Profile
            </h1>
          </div>

          {/* BOTH BUTTONS TOGETHER */}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50"
            >
              <Printer size={18} />
              Print Report
            </button>

            <button
              type="button"
              onClick={downloadFullStatementPDF}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <ReceiptText size={18} />
              Full Statement PDF
            </button>
          </div>
        </header>

        {/* PERSONAL DETAILS */}

        <section className="mb-7 rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-3xl font-extrabold text-green-700">
              {farmer.name?.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {farmer.name}
              </h2>

              <p className="mt-1 text-sm text-green-700">
                Farmer ID: #{farmer.id}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Phone size={16} className="text-green-600" />
                  {farmer.phone || "Phone not added"}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-600" />
                  {farmer.village || "Village not added"}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-green-600" />
                  Joined:{" "}
                  {farmer.createdAt
                    ? new Date(farmer.createdAt).toLocaleDateString("en-IN")
                    : "Not available"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FINANCIAL SUMMARY */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total Flower Purchase"
            amount={summary.totalPurchase}
            icon={<Flower2 size={23} />}
            color="blue"
          />

          <SummaryCard
            title="Total Payment Given"
            amount={summary.totalPayment}
            icon={<Wallet size={23} />}
            color="purple"
          />

          <SummaryCard
            title="Remaining Payable"
            amount={summary.remainingDue}
            icon={<ReceiptText size={23} />}
            color="green"
          />
        </section>

        {/* ACTION BUTTONS */}

        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={openAddPurchaseForm}
            className="flex items-center justify-center gap-3 rounded-2xl bg-green-700 px-5 py-5 font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-800"
          >
            <Plus size={22} />
            Add Flower Purchase
          </button>

          <button
            onClick={() => setShowPaymentForm(true)}
            className="flex items-center justify-center gap-3 rounded-2xl border border-green-200 bg-white px-5 py-5 font-bold text-green-800 shadow-sm transition hover:bg-green-50"
          >
            <Wallet size={22} />
            Add Payment
          </button>
        </section>

        {/* PURCHASE HISTORY */}

        <section className="mb-9 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Flower Purchase History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                All flower bills from this farmer
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
              {purchases.length} Bills
            </span>
          </div>

          {purchases.length === 0 ? (
            <EmptyState
              icon={<Flower2 size={34} />}
              message="No flower purchases recorded yet."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="p-5 sm:p-6">

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        Purchase Bill #{purchase.id}
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={15} />
                        {purchase.purchaseDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-extrabold text-green-700">
                        {money(purchase.totalAmount)}
                      </p>

                      <button
                        type="button"
                        onClick={() => downloadDailyInvoicePDF(purchase)}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        <ReceiptText size={16} />
                        Invoice PDF
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleEditPurchase(purchase)}
                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleDeletePurchase(purchase)}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500">
                          <th className="p-3 font-semibold">Flower</th>
                          <th className="p-3 font-semibold">Quantity</th>
                          <th className="p-3 font-semibold">Rate</th>
                          <th className="p-3 text-right font-semibold">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {purchase.items?.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-gray-100"
                          >
                            <td className="p-3 font-medium text-gray-800">
                              {item.flowerName}
                            </td>

                            <td className="p-3 text-gray-600">
                              {item.quantity} {item.unit}
                            </td>

                            <td className="p-3 text-gray-600">
                              {money(item.rate)}
                            </td>

                            <td className="p-3 text-right font-semibold text-gray-800">
                              {money(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {purchase.note && (
                    <p className="mt-3 text-sm text-gray-500">
                      Note: {purchase.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PAYMENT HISTORY */}

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              All payments made to {farmer.name}
            </p>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={<Wallet size={34} />}
              message="No payments recorded yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Payment Mode</th>
                    <th className="p-4 font-semibold">Note</th>
                    <th className="p-4 text-right font-semibold">
                      Amount
                    </th>
                    <th className="p-4 text-center font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t border-gray-100"
                    >
                      <td className="p-4 text-gray-700">
                        {payment.paymentDate}
                      </td>

                      <td className="p-4 text-gray-700">
                        {payment.paymentMode || "Not specified"}
                      </td>

                      <td className="p-4 text-gray-500">
                        {payment.note || "-"}
                      </td>

                      <td className="p-4 text-right font-bold text-green-700">
                        {money(payment.amount)}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleDeletePayment(payment)}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ADD / EDIT PURCHASE MODAL */}

      {showPurchaseForm && (
        <Modal
          title={
            editingPurchaseId
              ? `Edit Purchase Bill #${editingPurchaseId}`
              : "Add Flower Purchase"
          }
          subtitle={
            editingPurchaseId
              ? `Update purchase details for ${farmer.name}`
              : `Record a new purchase for ${farmer.name}`
          }
          onClose={() => {
            setShowPurchaseForm(false);
            resetPurchaseForm();
          }}
        >
          <form onSubmit={savePurchase} className="space-y-5">

            <FormField label="Purchase Date">
              <input
                type="date"
                required
                value={purchaseData.purchaseDate}
                onChange={(e) =>
                  setPurchaseData((previous) => ({
                    ...previous,
                    purchaseDate: e.target.value,
                  }))
                }
                className="form-input"
              />
            </FormField>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">
                  Flower Items
                </label>

                <button
                  type="button"
                  onClick={addFlowerRow}
                  className="flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-900"
                >
                  <Plus size={17} />
                  Add Flower
                </button>
              </div>

              <div className="space-y-4">
                {purchaseData.items.map((item, index) => {
                  const lineTotal =
                    (Number(item.quantity) || 0) *
                    (Number(item.rate) || 0);

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-green-100 bg-green-50/50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-green-800">
                          Flower {index + 1}
                        </span>

                        <button
                          type="button"
                          disabled={purchaseData.items.length === 1}
                          onClick={() => removeFlowerRow(index)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                          aria-label="Remove flower"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FormField label="Flower Name">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Marigold"
                            value={item.flowerName}
                            onChange={(e) =>
                              updateFlower(
                                index,
                                "flowerName",
                                e.target.value
                              )
                            }
                            className="form-input"
                          />
                        </FormField>

                        <FormField label="Quantity">
                          <input
                            type="number"
                            required
                            min="0.001"
                            step="0.001"
                            placeholder="e.g. 10"
                            value={item.quantity}
                            onChange={(e) =>
                              updateFlower(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="form-input"
                          />
                        </FormField>

                        <FormField label="Unit">
                          <select
                            value={item.unit}
                            onChange={(e) =>
                              updateFlower(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                            className="form-input"
                          >
                            <option value="kg">Kg</option>
                            <option value="gram">Gram</option>
                            <option value="piece">Piece</option>
                            <option value="bundle">Bundle</option>
                            <option value="bag">Bag</option>
                          </select>
                        </FormField>

                        <FormField label="Rate (₹ per unit)">
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            placeholder="e.g. 80"
                            value={item.rate}
                            onChange={(e) =>
                              updateFlower(
                                index,
                                "rate",
                                e.target.value
                              )
                            }
                            className="form-input"
                          />
                        </FormField>
                      </div>

                      <div className="mt-3 flex justify-between border-t border-green-100 pt-3 text-sm">
                        <span className="text-gray-500">
                          Item Total
                        </span>

                        <strong className="text-green-800">
                          {money(lineTotal)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <FormField label="Note (Optional)">
              <textarea
                rows="2"
                placeholder="Purchase details..."
                value={purchaseData.note}
                onChange={(e) =>
                  setPurchaseData((previous) => ({
                    ...previous,
                    note: e.target.value,
                  }))
                }
                className="form-input resize-y"
              />
            </FormField>

            <div className="flex items-center justify-between rounded-xl bg-green-100 p-4">
              <span className="font-bold text-green-900">
                Bill Total
              </span>

              <span className="text-xl font-extrabold text-green-900">
                {money(purchaseTotal)}
              </span>
            </div>

            <ModalActions
              onCancel={() => {
                setShowPurchaseForm(false);
                resetPurchaseForm();
              }}
              saving={saving}
              submitLabel={
                editingPurchaseId
                  ? "Update Purchase Bill"
                  : "Save Purchase Bill"
              }
            />
          </form>
        </Modal>
      )}

      {/* ADD PAYMENT MODAL */}

      {showPaymentForm && (
        <Modal
          title="Add Farmer Payment"
          subtitle={`Record payment given to ${farmer.name}`}
          onClose={() => setShowPaymentForm(false)}
        >
          <form onSubmit={savePayment} className="space-y-5">
            <FormField label="Payment Amount (₹)">
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData((previous) => ({
                    ...previous,
                    amount: e.target.value,
                  }))
                }
                className="form-input"
              />
            </FormField>

            <FormField label="Payment Date">
              <input
                type="date"
                required
                value={paymentData.paymentDate}
                onChange={(e) =>
                  setPaymentData((previous) => ({
                    ...previous,
                    paymentDate: e.target.value,
                  }))
                }
                className="form-input"
              />
            </FormField>

            <FormField label="Payment Mode">
              <select
                value={paymentData.paymentMode}
                onChange={(e) =>
                  setPaymentData((previous) => ({
                    ...previous,
                    paymentMode: e.target.value,
                  }))
                }
                className="form-input"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </FormField>

            <FormField label="Note (Optional)">
              <textarea
                rows="2"
                placeholder="Payment note..."
                value={paymentData.note}
                onChange={(e) =>
                  setPaymentData((previous) => ({
                    ...previous,
                    note: e.target.value,
                  }))
                }
                className="form-input resize-y"
              />
            </FormField>

            <ModalActions
              onCancel={() => setShowPaymentForm(false)}
              saving={saving}
              submitLabel="Save Payment"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

// =====================================
// REUSABLE COMPONENTS
// =====================================

function SummaryCard({ title, amount, icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className={`rounded-xl p-3 ${styles[color]}`}>
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-extrabold text-gray-900">
        {money(amount)}
      </h3>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-14 text-center text-gray-400">
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-700">
        {label}
      </label>

      {children}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, saving, submitLabel }) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
