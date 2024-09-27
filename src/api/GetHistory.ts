import needle from 'needle';
import { BusinessFullData } from '../interface/interface';

export const _getHistory = (relayUrl: string, address: string) =>
    new Promise<BusinessFullData[]>((resolve, reject) => {
        needle('post', `${relayUrl}/relay/web/fetch_history`, {
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
