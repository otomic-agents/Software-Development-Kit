import superagent from 'superagent';
import { BusinessFullData, SwapType } from '../interface/interface';

export const _getHistory = (relayUrl: string, address: string, swapType: SwapType) =>
    new Promise<BusinessFullData[]>((resolve, reject) => {
        let queryUrl =
            swapType == SwapType.ATOMIC
                ? `${relayUrl}/relay/web/fetch_history`
                : `${relayUrl}/relay/web/single_swap/fetch_history`;
        superagent
            .post(queryUrl)
            .query({
                address: address.toLowerCase(),
            })
            .then((resp) => {
                if (resp.statusCode == 200) {
                    resolve(resp.body.history);
                } else {
                    reject(`server error ${resp.statusCode}, URL: ${relayUrl}/relay/web/fetch_history`);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
