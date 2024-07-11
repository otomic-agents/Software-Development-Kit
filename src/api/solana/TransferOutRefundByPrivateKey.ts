import { Connection, Keypair } from "@solana/web3.js";
import { doTransferOutRefund, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";
import { removePrefix0x } from "../../utils/format"

export const _transferOutRefundByPrivateKey = 
    (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined, uuid?: string) => 
        new Promise<{txHash: string, uuid: string}>(async (resolve, reject) => {
    const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(removePrefix0x(privateKey), 'hex')))
    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)
    let {tx, uuidBack} = await doTransferOutRefund(preBusiness, provider, network, uuid)
    
    const latestBlockhash = await provider.getLatestBlockhash()
    tx.recentBlockhash = latestBlockhash.blockhash
    tx.feePayer = keypair.publicKey
    tx.sign(keypair)

    try {
        let txHash = await provider.sendRawTransaction(tx.serialize())

        resolve({
            txHash,
            uuid: uuidBack
        })
    } catch (err) {
        reject(err)
    }
})