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
    uuid?: string,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        const provider: Connection = getJsonRpcProviderByChainId(
            preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id,
            rpc,
            network,
        );

        let { tx, uuidBack } = await doTransferInConfirm(preBusiness, provider, network, sender, uuid);

        const latestBlockhash = await provider.getLatestBlockhash('confirmed');
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

        try {
            const { signature } = await phantomAPI.signAndSendTransaction(tx);
            resolve({
                txHash: signature,
                uuid: uuidBack,
            });
        } catch (err) {
            reject(err);
        }
    });
