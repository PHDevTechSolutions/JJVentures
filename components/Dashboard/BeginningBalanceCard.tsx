"use client";

import React, { useState, useEffect } from "react";
import { motion, animate } from "framer-motion";
import { FaWallet } from "react-icons/fa";

interface BeginningBalanceProps {
  selectedMonth: string;
  selectedYear: string;
  Location: string;
  Role: string;
}

const BeginningBalanceCard: React.FC<BeginningBalanceProps> = ({ selectedMonth, selectedYear, Location, Role }) => {
  const [beginningBalance, setBeginningBalance] = useState<number>(0);
  const [displayBalance, setDisplayBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBeginningBalance = async () => {
      try {
        const response = await fetch(`/api/Dashboard/FetchPediente?location=${Location}&role=${Role}&month=${selectedMonth}&year=${selectedYear}`);
        if (!response.ok) throw new Error("Failed to fetch beginning balance");

        const result = await response.json();
        const previousBalance = result.previousBalance || 0;

        // Animate the number transition
        animate(displayBalance, previousBalance, {
          duration: 1.5,
          onUpdate: (val) => setDisplayBalance(Math.floor(val)),
        });

        setBeginningBalance(previousBalance);
      } catch (error) {
        console.error("Error fetching beginning balance:", error);
      }
    };

    fetchBeginningBalance();
  }, [selectedMonth, selectedYear, Location, Role]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white shadow-md rounded-xl p-12 text-center overflow-hidden">
      {/* Background Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <FaWallet className="text-gray-300 text-9xl" />
      </div>

      {/* Content */}
      <h3 className="text-xs font-semibold text-gray-600">Beginning Balance</h3>
      <motion.p
        className="text-md md:text-md lg:text-3xl font-bold text-gray-800"
        key={displayBalance} // Re-render when value updates
      >

        ₱{displayBalance.toLocaleString()}
      </motion.p>
    </motion.div>
  );
};

export default BeginningBalanceCard;
