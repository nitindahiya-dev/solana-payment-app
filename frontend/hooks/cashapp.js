import { useState, useEffect } from "react";
import { getAvatarUrl } from "../functions/getAvatarUrl";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  publicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bigNumber from "bignumber.js";

export const useCashApp = () => {
  const { connected, publicKey } = useWallet();
  const [avatar, setAvatar] = useState("");
  const [userAddress, setUserAddress] = useState("none");

  // Get Avatar based on the userAddress
  useEffect(() => {
    if (connected) 
      setAvatar(getAvatarUrl(publicKey))
    setUserAddress(publicKey.toString())
  }, [connected]);

  return {
    connected,
    publicKey,
    avatar,
    userAddress,
    
  };
};
