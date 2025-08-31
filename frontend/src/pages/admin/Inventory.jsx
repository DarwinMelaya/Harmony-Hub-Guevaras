import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInventory(response.data.data || response.data.inventory || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle image file change and convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle add inventory
  const handleAddInventory = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name || !price) {
      setError("Name and price are required.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/inventory",
        { name, price, image },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(response.data.message || "Inventory item added successfully.");
      setName("");
      setPrice("");
      setImage("");
      setImagePreview(null);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

          {/* Add Inventory Form */}
          <form
            onSubmit={handleAddInventory}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8"
          >
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="e.g. Sounds and lights"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Price (₱)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="e.g. 10000"
                min="0"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-24 rounded border border-gray-600"
                />
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
            >
              Add Inventory
            </button>
            {error && <div className="mt-4 text-red-400">{error}</div>}
            {success && <div className="mt-4 text-green-400">{success}</div>}
          </form>

          {/* Inventory Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : inventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No inventory items found.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded border border-gray-600"
                            />
                          ) : (
                            <span className="text-gray-500">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ₱{Number(item.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
