import { Connection, Keypair } from "@solana/web3.js";
import { doTransferOutConfirm, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";

export const _transferOutConfirmByPrivateKey = 
    (uuid: string, preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
        new Promise<string>(async (resolve, reject) => {

    const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, 'hex')))
    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)
    const transferOutConfirmTx = await doTransferOutConfirm(uuid, preBusiness, provider, network)
    
    const latestBlockhash = await provider.getLatestBlockhash()
    transferOutConfirmTx.recentBlockhash = latestBlockhash.blockhash
    transferOutConfirmTx.feePayer = keypair.publicKey
    transferOutConfirmTx.sign(keypair)

    try {
        let txHash = await provider.sendRawTransaction(transferOutConfirmTx.serialize())

        resolve(txHash)
    } catch (err) {
        reject(err)
    }
})
