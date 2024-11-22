import { Connection, PublicKey } from '@solana/web3.js';
import { _getTransferOutRefundTransaction, getJsonRpcProvider } from '../../business/solana';
import { PreBusiness } from '../../interface/interface';
import { ResponseSolana } from '../../interface/api';

export const _transferOutRefundByWalletPlugin = (
    preBusiness: PreBusiness,
    phantomAPI: any,
    network: string,
    rpc: string | undefined,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        try {
            const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network);

            let tx = await _getTransferOutRefundTransaction(preBusiness, provider, network);

            const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            const { signature } = await phantomAPI.signAndSendTransaction(tx);
            resolve({ txHash: signature });
        } catch (err) {
            reject(err);
        }
    });
