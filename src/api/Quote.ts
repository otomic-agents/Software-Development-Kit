import { Socket, io } from "socket.io-client";

import { AskIF } from "../interface/interface";
import { OnQuoteIF } from "../interface/interface";
import { jsonParser } from "../utils/data";

export class QuoteManager {
    
    asking: boolean = false

    socket: Socket | undefined = undefined

    ask = (askIF: AskIF, callback: OnQuoteIF, relayUrl: string) => {

        if (this.asking) {
            throw new Error("Currently requesting a quote");
        }

        this.asking = true

        this.socket = io(`${relayUrl}`, {withCredentials: true})
        this.socket.on("quote", data => {          
            callback.OnQuote(jsonParser(data))
        })

        this.socket.on("connect", () => {
            const bridgeName = `${askIF.bridge.src_chain_id}_${askIF.bridge.dst_chain_id}_${askIF.bridge.src_token}_${askIF.bridge.dst_token}`
            this.socket?.emit("ask", bridgeName, askIF.amount);
        })

        this.socket.on("disconnect", () => {
            this.asking = false
        })
    }

    stopAsk = () => {
        this.socket?.close()
    }
}
