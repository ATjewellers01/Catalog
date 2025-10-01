import { FileText, History } from "lucide-react";

const BookingsTab = ({
  orders,
  generatingPDF,
  handleDownloadOrderPDF,
  handleViewHistory,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col p-3 space-y-3 border-b border-gray-200 sm:flex-row sm:justify-between sm:items-center sm:p-6 sm:space-y-0">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
          User Bookings (Orders)
        </h2>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleViewHistory}
            className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm transition-all hover:bg-gray-200 hover:shadow-md"
          >
            <History className="w-4 h-4" />
            <span className="ml-2 text-sm font-medium">History</span>
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-6">
        <div className="space-y-6">
          {orders.length > 0 ? (
            <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order History
                  </h3>
                  <span className="text-sm text-gray-500">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Items
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Total Weight
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Download
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
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
                          <div className="text-sm text-gray-900">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {order.items?.map(item => item.name).join(', ') || 'No items'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {order.items && order.items.length > 0
                            ? `${order.items.reduce((total, item) => total + Number(item.weight || 0), 0)}g`
                            : 'N/A'}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsTab;