import { useState, useEffect } from "react"
import { getAvatarUrl } from "../functions/getAvatarUrl"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  publicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js"
import bigNumber from "bignumber.js"

export const useCashApp = () => {
  const { connected, publicKey, sendTransaction } = useWallet()
  const [avatar, setAvatar] = useState("")
  const [amount, setAmount] = useState(0)
  const [receiver, setReceiver] = useState("")
  const [transactionPurpose, setTransactionPurpose] = useState("")
  const [userAddress, setUserAddress] = useState("none")
  const { Connection } = useConnection()

  // Get Avatar based on the userAddress
  useEffect(() => {
    if (connected) 
    setAvatar(getAvatarUrl(publicKey.toString()))
    // setUserAddress(publicKey.toString())
  }, [connected])

  const makeTransaction = async (fromWallet, toWallet, amount, reference) => {
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)

    const { blockhash } = await connection.getLatestBlockhash("finalized")

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromWallet,
    })

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromWallet,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: toWallet,
    })

    transferInstruction.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    })

    transaction.add(transferInstruction)
    return transaction
  }

  const doTransaction = async ({ amount, receiver, transactionPurpose }) => {
    const fromWallet = publicKey
    const toWallet = new publicKey(receiver)
    const bnAmount = new bigNumber(amount)
    const reference = Keypair.generate().publicKey
    const transaction = await makeTransaction(
      fromWallet,
      toWallet,
      bnAmount,
      reference
    )

    const txnhash = await sendTransaction(transaction, connection)

    console.log(txnhash)
  }

  return {
    connected,
    publicKey,
    avatar,
    userAddress,
    doTransaction,
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
  }
}
