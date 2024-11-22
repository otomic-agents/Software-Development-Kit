import superagent from 'superagent';
import { Bridge } from '../interface/interface';

export const _getBridge = (relayUrl: string) =>
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
