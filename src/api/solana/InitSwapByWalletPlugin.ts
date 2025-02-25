import { Connection } from '@solana/web3.js';
import { _getInitSwapTransaction, getJsonRpcProvider } from '../../business/solana';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { ResponseSolana } from '../../interface/api';

export const _initSwapByWalletPlugin = (
    preBusiness: PreBusiness,
    phantomAPI: any,
    network: NetworkType,
    rpc: string | undefined,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        try {
            const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network);

            //transfer out
            let tx = await _getInitSwapTransaction(preBusiness, provider, network);

            // const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            // tx.recentBlockhash = latestBlockhash.blockhash;
            // tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            const { signature } = await phantomAPI.signAndSendTransaction(tx);
            resolve({ txHash: signature });
        } catch (err) {
            reject(err);
        }
    });
