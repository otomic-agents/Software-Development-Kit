import needle from 'needle'
import { Quote, SignData } from "../interface/interface";

export const swap = (quote: Quote, signData: SignData, signed: string, relayUrl: string) => new Promise<void>((resolve, reject) => {

    const data = {
        quote: quote,
        bridge_name: quote.quote_base.bridge.bridge_name,
        lp_id_fake: quote.lp_info.lp_id_fake,

        // TODO FIXME: near need this value to match token
        // append_information: JSON.stringify({user_account_id:receiving_address.value}),

        // TODO : This value can be different from requestor.
        sender: signData.message.requestor,

        amount: signData.message.src_amount,
        step_time_lock: signData.message.step_time_lock,
        dst_address: signData.message.dst_address,
        dst_amount: signData.message.dst_amount,
        dst_native_amount: signData.message.dst_native_amount,
        agreement_reached_time: signData.message.agreement_reached_time,
        requestor: signData.message.requestor
    }

    needle('post', `${relayUrl}/relay/web/quote_confirmation`, data)
    .then(resp => {
        if (resp.statusCode == 200) {
            resolve(resp.body.data)
        } else {
            reject(`server error ${resp.statusCode}, URL: ${relayUrl}/relay/web/quote_confirmation`)
        }
    })
    .catch(error => {
        reject(error)
    })
})
