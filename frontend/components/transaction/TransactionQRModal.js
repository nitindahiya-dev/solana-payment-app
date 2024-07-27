import Modal from "../Modal";
import {
  createQR,
  encodeURL,
  findReference,
  validateTransfer,
  FindReferenceError,
  ValidateTransferError,
} from "@solana/pay";
import { PublicKey, Keypair } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useRef, useState } from "react";
import { truncate } from "../../utils/string";
import { useCashApp } from "../../hooks/cashapp";
import { getAvatarUrl } from "../../functions/getAvatarUrl";

const TransactionQRModal = ({ modalOpen, setModalOpen, userAddress }) => {
  const qrRef = useRef();
  const { transactions, setTransactions } = useCashApp();
  const { connection } = useConnection();
  const [qrCode, setQrCode] = useState(false);

  // Set the state to true to rerender the component with generated QR
  const loadQr = () => {
    setQrCode(true);
  };

  useEffect(() => {
    if (!userAddress) {
      console.error("Invalid user address");
      return;
    }

    try {
      const recipient = new PublicKey(userAddress);
      const amount = new BigNumber("1");
      const reference = Keypair.generate().publicKey;
      const label = "Evil cookies cooperation";
      const msg = "Thanks for your soul";

      const urlParam = {
        recipient,
        amount,
        reference,
        label,
        msg,
      };

      const url = encodeURL(urlParam);
      const qr = createQR(url, 488, "transparent");

      if (qrRef.current) {
        qrRef.current.innerHTML = "";
        qr.append(qrRef.current);

        const interval = setInterval(async () => {
          console.log("waiting for transaction confirmation");
          try {
            const signInfo = await findReference(connection, reference, {
              finality: "confirmed",
            });
            console.log("validating");
            await validateTransfer(
              connection,
              signInfo.signature,
              {
                recipient,
                amount,
                reference,
              },
              {
                commitment: "confirmed",
              }
            );

            const newID = (transactions.length + 1).toString();
            const newTransaction = {
              id: newID,
              from: {
                name: recipient.toString(),
                handle: recipient.toString(),
                avatar: getAvatarUrl(recipient.toString()),
                verified: true,
              },
              to: {
                name: reference.toString(),
                handle: "-",
                avatar: getAvatarUrl(reference.toString()),
                verified: false,
              },
              description: "User sent you some soul",
              transactionDate: new Date(),
              status: "Completed",
              amount: amount.toString(),
              source: "-",
              identifier: "-",
            };
            setTransactions([newTransaction, ...transactions]);
            setModalOpen(false);

            clearInterval(interval);
          } catch (err) {
            if( err instanceof FindReferenceError) return;

            if(err instanceof ValidateTransferError) console.log('Transaction is invalid', err);

            console.error("unknown error", err);
          }
        }, 500);
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error("Failed to create QR code:", error);
    }
  }, [
    userAddress,
    qrCode,
    connection,
    transactions,
    setTransactions,
    setModalOpen,
  ]);

  return (
    <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
      <div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <div ref={qrRef} />
        </div>

        <div className="flex flex-col items-center justify-center space-y-1">
          <p className="text-lg font-medium text-gray-800">
            {truncate(userAddress)}
          </p>

          <p className="text-sm font-light text-gray-600">
            Scan to pay {truncate(userAddress)}
          </p>

          <button
            onClick={loadQr}
            className="w-full rounded-lg bg-[#16d542] py-3 hover:bg-opacity-70"
          >
            <span className="font-medium text-white">Load QR code</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionQRModal;
