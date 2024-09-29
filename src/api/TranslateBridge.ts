import { getDefaultRPC, symbol } from '../business/evm';
import { getDefaultRPC as getSolanaDefaultRPC, symbol as solanaSymbol } from '../business/solana';
import { TranslatedBridge } from '../interface/api';
import { Bridge } from '../interface/interface';
import { getChainName, getChainType } from '../utils/chain';

export const translateBridge = (bridges: Bridge[], network: string, rpcs: { [key: string]: string }) =>
    new Promise<TranslatedBridge[]>(async (resolve, reject) => {
        try {
            const translatedBridges: TranslatedBridge[] = [];
            for (const bridge of bridges) {
                const srcChainName = getChainName(bridge.src_chain_id);
                const dstChainName = getChainName(bridge.dst_chain_id);

                const srcRpc = rpcs[srcChainName];
                const dstRpc = rpcs[dstChainName];

                let srcTokenSymbol = '';
                if (getChainType(bridge.src_chain_id) === 'evm') {
                    srcTokenSymbol = await symbol(
                        bridge.src_chain_id,
                        bridge.src_token,
                        srcRpc == undefined ? getDefaultRPC(bridge.src_chain_id, network) : srcRpc,
                    );
                } else if (getChainType(bridge.src_chain_id) === 'solana') {
                    srcTokenSymbol = await solanaSymbol(
                        bridge.src_chain_id,
                        bridge.src_token,
                        srcRpc == undefined ? getSolanaDefaultRPC(bridge.src_chain_id, network) : srcRpc,
                    );
                }

                let dstTokenSymbol = '';
                if (getChainType(bridge.dst_chain_id) === 'evm') {
                    dstTokenSymbol = await symbol(
                        bridge.dst_chain_id,
                        bridge.dst_token,
                        dstRpc == undefined ? getDefaultRPC(bridge.dst_chain_id, network) : dstRpc,
                    );
                } else if (getChainType(bridge.dst_chain_id) === 'solana') {
                    dstTokenSymbol = await solanaSymbol(
                        bridge.dst_chain_id,
                        bridge.dst_token,
                        dstRpc == undefined ? getSolanaDefaultRPC(bridge.dst_chain_id, network) : dstRpc,
                    );
                }

                translatedBridges.push(
                    Object.assign(
                        {
                            srcChainName,
                            dstChainName,
                            srcTokenSymbol,
                            dstTokenSymbol,
                        },
                        bridge,
                    ),
                );
            }
            resolve(translatedBridges);
        } catch (error) {
            reject(error);
        }
    });
