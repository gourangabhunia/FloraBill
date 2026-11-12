
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  Users,
  MapPin,
  Phone,
  X,
  Leaf,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/farmers";

export default function Farmers() {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    village: "",
  });

  // FETCH FARMERS

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch farmers");
      }

      setFarmers(data.farmers || []);
    } catch (err) {
      setError(err.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  // FORM INPUT

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ADD FARMER

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Farmer name is required");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to add farmer");
      }

      setFarmers((previous) => [data.farmer, ...previous]);

      setFormData({
        name: "",
        phone: "",
        village: "",
      });

      setShowForm(false);
      alert("Farmer added successfully!");
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // SEARCH FARMERS

  const filteredFarmers = farmers.filter((farmer) => {
    const value = search.toLowerCase();

    return (
      farmer.name?.toLowerCase().includes(value) ||
      farmer.phone?.toLowerCase().includes(value) ||
      farmer.village?.toLowerCase().includes(value)
    );
  });

  // OPEN FARMER PROFILE

  const openFarmerProfile = (farmerId) => {
    navigate(`/farmers/${farmerId}`);
  };

  // UI

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-3 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-8">

      <div className="mx-auto w-full max-w-7xl">

        {/* HEADER */}

        <header className="mb-7 flex items-start justify-between gap-3 sm:mb-10">

          <div className="min-w-0 flex-1">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-4 flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-green-700 transition hover:text-green-900"
            >
              <ArrowLeft size={17} />
              Back to Home
            </button>

            <p className="mb-2 text-xs font-bold tracking-[2px] text-green-700 sm:tracking-[3px]">
              GOURANGA FLORIST
            </p>

            <h1 className="break-words text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Farmer Management
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage your flower suppliers in one place.
            </p>

          </div>

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 sm:flex lg:h-16 lg:w-16">
            <Leaf size={30} />
          </div>

        </header>

        {/* TOTAL FARMERS */}

        <div className="mb-7 w-full max-w-xs rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:mb-8 sm:p-5">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-green-100 p-3 text-green-700">
              <Users size={25} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Farmers
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                {farmers.length}
              </h2>
            </div>

          </div>

        </div>

        {/* SEARCH AND ADD */}

        <div className="mb-8 flex flex-col gap-3 sm:mb-9 sm:flex-row">

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 shadow-sm transition focus-within:border-green-500">

            <Search
              size={20}
              className="shrink-0 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by name, phone or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-0 py-4 text-sm outline-none"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="shrink-0 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            )}

          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-green-800 sm:w-auto"
          >
            <Plus size={20} />
            Add Farmer
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">

            <span className="break-words">
              {error}
            </span>

            <button
              type="button"
              onClick={fetchFarmers}
              className="w-fit font-bold underline"
            >
              Retry
            </button>

          </div>
        )}

        {/* FARMER LIST HEADING */}

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            All Farmers
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredFarmers.length} farmers found
          </p>
        </div>

        {/* LOADING AND FARMER LIST */}

        {loading ? (

          <div className="rounded-2xl bg-white py-16 text-center text-gray-500 shadow-sm">
            Loading farmers...
          </div>

        ) : filteredFarmers.length === 0 ? (

          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-green-200 bg-white px-5 py-10 text-center">

            <Users size={45} className="mb-4 text-green-600" />

            <h3 className="text-lg font-bold text-gray-800">
              No farmers found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try another search term."
                : "Add your first farmer to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                <Plus size={18} />
                Add First Farmer
              </button>
            )}

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">

            {filteredFarmers.map((farmer) => (

              <div
                key={farmer.id}
                onClick={() => openFarmerProfile(farmer.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFarmerProfile(farmer.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group min-w-0 cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:p-6"
              >

                {/* CARD TOP */}

                <div className="mb-5 flex items-center justify-between">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl font-bold text-green-700">
                    {farmer.name?.charAt(0).toUpperCase()}
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>

                </div>

                {/* FARMER NAME */}

                <h3 className="mb-4 break-words text-lg font-bold text-gray-900">
                  {farmer.name}
                </h3>

                {/* FARMER DETAILS */}

                <div className="space-y-3 text-sm text-gray-500">

                  <p className="flex min-w-0 items-start gap-3 break-words">
                    <Phone
                      size={17}
                      className="mt-0.5 shrink-0 text-green-600"
                    />
                    <span className="min-w-0 break-all">
                      {farmer.phone || "Phone not added"}
                    </span>
                  </p>

                  <p className="flex min-w-0 items-start gap-3 break-words">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-green-600"
                    />
                    <span className="min-w-0 break-words">
                      {farmer.village || "Village not added"}
                    </span>
                  </p>

                </div>

                {/* PROFILE LINK */}

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-4 text-sm font-semibold text-green-700">

                  <span>
                    View Full Profile
                  </span>

                  <ChevronRight
                    size={19}
                    className="shrink-0 transition group-hover:translate-x-1"
                  />

                </div>

              </div>

            ))}

          </div>

        )}

        {/* ADD FARMER MODAL */}

        {showForm && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-5"
            onClick={() => !saving && setShowForm(false)}
          >

            <div
              className="my-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >

              {/* MODAL HEADER */}

              <div className="mb-6 flex items-start justify-between gap-3 sm:mb-7">

                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Add New Farmer
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter farmer details below.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                  className="shrink-0 rounded-xl bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                >
                  <X size={21} />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Farmer Name *
                  </label>

                  <input
                    name="name"
                    type="text"
                    placeholder="Enter farmer name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>

                  <input
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* VILLAGE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Village
                  </label>

                  <input
                    name="village"
                    type="text"
                    placeholder="Enter village name"
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* BUTTONS */}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Farmer"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}
