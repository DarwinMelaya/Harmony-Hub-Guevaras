import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import UnitsTab from "../../components/Admin/Maintenance/UnitsTab";
import CategoryTab from "../../components/Admin/Maintenance/CategoryTab";
import PaymentInfo from "../../components/Admin/Maintenance/PaymentInfo";
import { Wrench } from "lucide-react";

const Maintenance = () => {
  const [activeTab, setActiveTab] = useState("units");

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold">Maintenance</h1>
              </div>
              <p className="text-gray-400">
                Manage units and categories for inventory items
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
            <div className="flex gap-2 border-b border-gray-700">
              <button
                onClick={() => setActiveTab("units")}
                className={`px-6 py-4 font-medium transition-all relative ${
                  activeTab === "units"
                    ? "text-blue-400 bg-gray-700/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                }`}
              >
                Units
                {activeTab === "units" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("category")}
                className={`px-6 py-4 font-medium transition-all relative ${
                  activeTab === "category"
                    ? "text-blue-400 bg-gray-700/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                }`}
              >
                Category
                {activeTab === "category" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`px-6 py-4 font-medium transition-all relative ${
                  activeTab === "payment"
                    ? "text-blue-400 bg-gray-700/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                }`}
              >
                Payment Info
                {activeTab === "payment" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "units" && <UnitsTab />}
              {activeTab === "category" && <CategoryTab />}
              {activeTab === "payment" && <PaymentInfo />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Maintenance;
