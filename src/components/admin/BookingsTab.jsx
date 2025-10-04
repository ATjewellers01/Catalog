import { FileText, History, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const BookingsTab = ({
  orders,
  generatingPDF,
  handleDownloadOrderPDF,
  handleViewHistory,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col p-6 space-y-4 border-b border-gray-200 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">
          User Bookings (Orders)
        </h2>
        <div className="flex items-center space-x-3">
          {/* <button
            onClick={handleViewHistory}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm transition-all hover:bg-gray-200 hover:shadow-md"
          >
            <History className="w-4 h-4" />
            <span className="ml-2 text-sm font-medium">History</span>
          </button> */}
        </div>
      </div>
      <div className="p-6">
        {orders.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Order ID",
                        "Customer",
                        "Items",
                        "Total Weight",
                        "Date",
                        "Download"
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <TableRow 
                        key={order.id} 
                        order={order} 
                        generatingPDF={generatingPDF}
                        handleDownloadOrderPDF={handleDownloadOrderPDF}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  generatingPDF={generatingPDF}
                  handleDownloadOrderPDF={handleDownloadOrderPDF}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyOrders />
        )}
      </div>
    </div>
  );
};

// Table Row for Desktop View
const TableRow = ({ order, generatingPDF, handleDownloadOrderPDF }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalWeight = order.items?.reduce((total, item) => total + Number(item.weight || 0), 0) || 0;
  const items = order.items || [];
  
  return (
    <>
      <tr key={order.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          #{order.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10">
              <div className="flex justify-center items-center w-10 h-10 font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                {order.users?.user_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {order.users?.user_name || 'Unknown Customer'}
              </div>
              <div className="text-sm text-gray-500">
                {order.users?.phone_number || 'No phone'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-900">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center p-1 text-gray-400 rounded hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
          {totalWeight > 0 ? `${totalWeight}g` : 'N/A'}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
          {new Date(order.created_at).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => handleDownloadOrderPDF(order)}
            disabled={generatingPDF === order.id}
            className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span className="ml-2">
              {generatingPDF === order.id ? 'Generating...' : 'PDF'}
            </span>
          </button>
        </td>
      </tr>
      
      {/* Expanded Items Row */}
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-6 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">All Items:</h4>
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                  <img
                    src={item.product_image_url || "https://via.placeholder.com/48x48?text=No+Image"}
                    alt={item.product_name || item.name}
                    className="object-cover w-12 h-12 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {item.product_name || item.name}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>Qty: {item.quantity || 1}</span>
                      {item.weight && <span>Weight: {item.weight}</span>}
                      {item.price > 0 && <span>₹{parseFloat(item.price).toLocaleString()}</span>}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.status && (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'booked' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// Order Card for Mobile View
const OrderCard = ({ order, generatingPDF, handleDownloadOrderPDF }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalWeight = order.items?.reduce((total, item) => total + Number(item.weight || 0), 0) || 0;
  const items = order.items || [];

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            Order #{order.id}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <button
          onClick={() => handleDownloadOrderPDF(order)}
          disabled={generatingPDF === order.id}
          className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          <span className="ml-2">
            {generatingPDF === order.id ? 'Generating...' : 'PDF'}
          </span>
        </button>
      </div>

      {/* Customer Info */}
      <div className="flex items-center space-x-3 mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex justify-center items-center w-8 h-8 font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-sm">
          {order.users?.user_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">
            {order.users?.user_name || 'Unknown Customer'}
          </p>
          <p className="text-xs text-gray-600">
            {order.users?.phone_number || 'No phone'}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="flex justify-between items-center mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="text-sm">
          <span className="text-gray-500">Items: </span>
          <span className="font-medium text-gray-900">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Total Weight: </span>
          <span className="font-medium text-gray-900">
            {totalWeight > 0 ? `${totalWeight}g` : 'N/A'}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center p-1 text-gray-400 rounded hover:text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span className="ml-1 text-xs">Items</span>
        </button>
      </div>

      {/* Expandable Items Section */}
      {isExpanded && (
        <div className="pt-3 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 text-sm mb-3">All Items:</h4>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <img
                  src={item.product_image_url || "https://via.placeholder.com/48x48?text=No+Image"}
                  alt={item.product_name || item.name}
                  className="object-cover w-12 h-12 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {item.product_name || item.name}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span>Qty: {item.quantity || 1}</span>
                    {item.weight && <span>Weight: {item.weight}</span>}
                    {item.price > 0 && <span>₹{parseFloat(item.price).toLocaleString()}</span>}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.status && (
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'booked' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyOrders = () => (
  <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-gray-300 border-dashed">
    <div className="flex justify-center items-center mx-auto mb-4 w-20 h-20 bg-gray-100 rounded-full">
      <svg
        className="w-10 h-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="mb-2 text-lg font-semibold text-gray-900">
      No orders yet
    </h3>
    <p className="text-gray-600">
      Customer orders will appear here when they make purchases
    </p>
  </div>
);

export default BookingsTab;