import { Connection, Keypair } from "@solana/web3.js";
import { doTransferInConfirm, getJsonRpcProviderByChainId, ensureSendingTx } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";
import { removePrefix0x } from "../../utils/format"
import { ResponseSolana } from "../../interface/api"

export const _transferInConfirmByPrivateKey = 
    (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined, sender: string, uuid?: string) => 
        new Promise<ResponseSolana>(async (resolve, reject) => {
    const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(removePrefix0x(privateKey), 'hex')))
    const provider: Connection = getJsonRpcProviderByChainId(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id, rpc, network)
    let {tx, uuidBack} = await doTransferInConfirm(preBusiness, provider, network, sender, uuid)

    try {
        let txHash = await ensureSendingTx(provider, keypair, tx)

        resolve({
            txHash,
            uuid: uuidBack
        })
    } catch (err) {
        reject(err)
    }
})