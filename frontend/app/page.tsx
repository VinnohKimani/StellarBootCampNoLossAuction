"use client";

import { useState, useEffect } from "react";
import { Freighter } from "@stellar/freighter-api";

const CONTRACT_ID = "CCHWTOJNVRDSNNDSDZQRVVSJKXVS2IZCQJEZS3WSK7CW3DBL3VJYHUBZ";

export default function AuctionDashboard() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [highestBid, setHighestBid] = useState<string>("0");
  const [highestBidder, setHighestBidder] = useState<string>("None");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  // Connecting user's Freighter wallet extension
  const connectWallet = async () => {
    try {
      if (await Freighter.isConnected()) {
        const { address } = await Freighter.getAddress();
        if (address) {
          setWallet(address);
          setStatus("Wallet connected successfully!");
        } else {
          setStatus(
            "Failed to read account address. Secure your wallet extension.",
          );
        }
      } else {
        setStatus(
          "Freighter wallet not detected. Please install the browser extension.",
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("An error occurred during wallet connection authorization.");
    }
  };

  // Submiting action to place a bid on chain
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return setStatus("Please link your Freighter wallet first.");

    setLoading(true);
    setStatus(
      "Transaction initializing... Please sign transaction window popup.",
    );

    try {
     
      console.log(
        `Submitting bid for ${bidAmount} tokens from sender ${wallet}`,
      );

      // Simulatting transaction completion for testing layout actions
      setTimeout(() => {
        setHighestBid(bidAmount);
        setHighestBidder(wallet);
        setBidAmount("");
        setStatus(
          "Mock Transaction successful! (Deploy contract to update live ledger state)",
        );
        setLoading(false);
      }, 1500);
    } catch (error: any) {
      console.error(error);
      setStatus(`Transaction error: ${error.message || "Execution rejected"}`);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-1 text-center text-blue-500 tracking-tight">
          No-Loss Auction Protocol
        </h1>
        <p className="text-gray-400 text-xs text-center mb-6 uppercase tracking-widest">
          Stellar Soroban dApp Engine
        </p>

        {/* Wallet Link Status Section */}
        {!wallet ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-blue-900/30"
          >
            Connect Freighter Wallet
          </button>
        ) : (
          <div className="bg-gray-950 p-3 rounded-xl text-xs truncate mb-4 text-center border border-gray-800">
            Active Account:{" "}
            <span className="text-emerald-400 font-mono">{wallet}</span>
          </div>
        )}

        {/* On Chain State Reading Dashboards */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-gray-950 p-4 rounded-xl text-center border border-gray-800">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Highest Current Bid
            </p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {highestBid} SEP-41
            </p>
          </div>
          <div className="bg-gray-950 p-4 rounded-xl text-center border border-gray-800">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Top Bidder Address
            </p>
            <p className="text-xs font-semibold truncate mt-3 text-gray-300 font-mono">
              {highestBidder}
            </p>
          </div>
        </div>

        {/* Interaction Form Area */}
        <form onSubmit={handlePlaceBid} className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
              Bid Amount Deposit
            </label>
            <input
              type="number"
              step="any"
              required
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="0.00 Tokens"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition text-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition duration-200 ${
              loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {loading ? "Processing Ledger Action..." : "Submit Secure Bid"}
          </button>
        </form>

        {/* Runtime System Logs feedback info block */}
        {status && (
          <div className="mt-4 p-3 bg-gray-950 border border-gray-800 rounded-xl text-[11px] text-center text-gray-400 font-mono">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}
