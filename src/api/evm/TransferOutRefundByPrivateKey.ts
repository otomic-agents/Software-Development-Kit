import { ContractTransactionResponse, JsonRpcProvider, ethers } from "ethers";
import { PreBusiness } from "../../interface/interface";
import { doTransferOutRefund, getJsonRpcProvider } from "../../business/evm";


export const _transferOutRefundByPrivateKey = 
    (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
        new Promise<ContractTransactionResponse>(async (resolve, reject) => {
    
    const web3Wallet = new ethers.Wallet(privateKey)
    let provider: JsonRpcProvider = getJsonRpcProvider(preBusiness, rpc, network)
    
    const transferOutRefundTx = await doTransferOutRefund(preBusiness, provider, web3Wallet.connect(provider), network);

    resolve(transferOutRefundTx)
})