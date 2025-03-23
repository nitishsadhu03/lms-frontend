import StudentSidebar from "@/components/student/StudentSidebar";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import React, { useEffect, useState } from "react";
import { Eye, X, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const backend_url = import.meta.env.VITE_API_URL;

const StudentTransaction = () => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [payments, setPayments] = useState([]);

  // Map payment data to include a year property for filtering
  const processPayments = (paymentData) => {
    return paymentData.map((payment) => {
      const date = new Date(payment.date);
      return {
        ...payment,
        year: date.getFullYear().toString(),
      };
    });
  };

  // Get unique years for filter
  const getUniqueYears = (data) => {
    return ["all", ...new Set(data.map((item) => item.year))].sort().reverse();
  };

  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/student/payments`
      );
      const paymentData = response.data.payments;
      const processedPayments = processPayments(paymentData);
      setPayments(processedPayments);
      setFilteredTransactions(processedPayments);
      console.log("payments: ", response.data.payments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payments data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (selectedYear === "all") {
      setFilteredTransactions(payments);
    } else {
      setFilteredTransactions(
        payments.filter((payment) => payment.year === selectedYear)
      );
    }
  }, [selectedYear, payments]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openReceiptModal = (receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReceipt(null);
  };

  const downloadReceipt = () => {
    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = selectedReceipt.receiptImage;
    link.download = `Receipt_${formatDate(selectedReceipt.date)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add event listener to close modal on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isModalOpen]);

  // Get years only after payments are loaded
  const years = payments.length > 0 ? getUniqueYears(payments) : ["all"];

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Transactions</h1>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-700" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year === "all" ? "All Years" : year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <hr className="my-2" />

        {filteredTransactions.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">
            No transactions found for the selected year.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">
                    {formatDate(transaction.date)}
                  </h2>
                  <button
                    onClick={() => openReceiptModal(transaction)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label="View receipt"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full Screen Modal */}
        {isModalOpen && selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-8">
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col rounded-lg overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gray-800 p-4 flex justify-between items-center">
                <h3 className="text-white font-medium">
                  Receipt - {formatDate(selectedReceipt.date)}
                </h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={downloadReceipt}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700 hover:text-white"
                  >
                    <Download size={20} className="mr-1" />
                    Download
                  </Button>
                  <Button
                    onClick={closeModal}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700 hover:text-white"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>

              {/* Modal Body */}
              <div
                className="bg-white p-2 overflow-auto"
                style={{ maxHeight: "calc(90vh - 60px)" }}
              >
                <img
                  src={selectedReceipt.receiptImage}
                  alt="Receipt"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTransaction;
