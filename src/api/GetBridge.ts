import superagent from 'superagent';
import { Bridge, GetBridgesOption } from '../interface/interface';
import { TranslatedBridge } from '../interface/api';
import { getChainName, getChainType } from '../utils/chain';
import { getDefaultRPC, symbol } from '../business/evm';
import { getDefaultRPC as getSolanaDefaultRPC, symbol as solanaSymbol } from '../business/solana';

export const _getBridge = async (
    relayUrl: string,
    option: GetBridgesOption,
): Promise<Bridge[] | TranslatedBridge[]> => {
    const getBridges = () =>
        new Promise<Bridge[]>((resolve, reject) => {
            superagent
                .post(`${relayUrl}/relay/web/fetch_bridge`)
                .then((resp) => {
                    if (resp.statusCode == 200) {
                        if (resp.body.code == 200) {
                            resolve(resp.body.bridge_list);
                        } else {
                            reject(resp.body);
                        }
                    } else {
                        reject(`server error ${resp.statusCode}, URL: ${relayUrl}/relay/web/fetch_bridge`);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });

    return new Promise(async (resolve, reject) => {
        const bridges = await getBridges();

        if (option.detailed) {
            if (!option.network) {
                return reject('network is required');
            }
            try {
                const translatedBridges: TranslatedBridge[] = [];
                for (const bridge of bridges) {
                    const srcChainName = getChainName(bridge.src_chain_id);
                    const dstChainName = getChainName(bridge.dst_chain_id);

                    let srcRpc = undefined;
                    if (option.rpcs && option.rpcs[srcChainName]) {
                        srcRpc = option.rpcs[srcChainName];
                    }

                    let dstRpc = undefined;
                    if (option.rpcs && option.rpcs[dstChainName]) {
                        dstRpc = option.rpcs[dstChainName];
                    }

                    let srcTokenSymbol = '';
                    if (getChainType(bridge.src_chain_id) === 'evm') {
                        srcTokenSymbol = await symbol(
                            bridge.src_chain_id,
                            bridge.src_token,
                            srcRpc == undefined ? getDefaultRPC(bridge.src_chain_id, option.network) : srcRpc,
                        );
                    } else if (getChainType(bridge.src_chain_id) === 'solana') {
                        srcTokenSymbol = await solanaSymbol(
                            bridge.src_chain_id,
                            bridge.src_token,
                            srcRpc == undefined ? getSolanaDefaultRPC(bridge.src_chain_id, option.network) : srcRpc,
                        );
                    }

                    let dstTokenSymbol = '';
                    if (getChainType(bridge.dst_chain_id) === 'evm') {
                        dstTokenSymbol = await symbol(
                            bridge.dst_chain_id,
                            bridge.dst_token,
                            dstRpc == undefined ? getDefaultRPC(bridge.dst_chain_id, option.network) : dstRpc,
                        );
                    } else if (getChainType(bridge.dst_chain_id) === 'solana') {
                        dstTokenSymbol = await solanaSymbol(
                            bridge.dst_chain_id,
                            bridge.dst_token,
                            dstRpc == undefined ? getSolanaDefaultRPC(bridge.dst_chain_id, option.network) : dstRpc,
                        );
                    }

                    translatedBridges.push(
                        Object.assign(
                            {
                                src_chain_name: srcChainName,
                                dst_chain_name: dstChainName,
                                src_token_symbol: srcTokenSymbol,
                                dst_token_symbol: dstTokenSymbol,
                            },
                            bridge,
                        ),
                    );
                }
                resolve(translatedBridges);
            } catch (error) {
                reject(error);
            }
        } else {
            resolve(bridges);
        }
    });
};
