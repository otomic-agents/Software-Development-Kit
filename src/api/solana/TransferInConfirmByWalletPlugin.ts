import { Connection, PublicKey } from '@solana/web3.js';
import { doTransferInConfirm, getJsonRpcProviderByChainId } from '../../business/solana';
import { PreBusiness } from '../../interface/interface';
import { ResponseSolana } from '../../interface/api';

export const _transferInConfirmByWalletPlugin = (
    preBusiness: PreBusiness,
    phantomAPI: any,
    network: string,
    rpc: string | undefined,
    sender: string,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        reject("REMOVED: This function is not used anymore");
        // try {
        //     const provider: Connection = getJsonRpcProviderByChainId(
        //         preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id,
        //         rpc,
        //         network,
        //     );

        //     let tx = await doTransferInConfirm(preBusiness, provider, network, sender);

        //     const latestBlockhash = await provider.getLatestBlockhash('confirmed');
        //     tx.recentBlockhash = latestBlockhash.blockhash;
        //     tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

        //     const { signature } = await phantomAPI.signAndSendTransaction(tx);
        //     resolve({ txHash: signature });
        // } catch (err) {
        //     reject(err);
        // }
    });
