import { Socket, io } from "socket.io-client";

import { AskIF } from "../interface/interface";
import { OnQuoteIF } from "../interface/interface";
import { jsonParser } from "../utils/data";

export class QuoteManager {
    
    asking: boolean = false

    socket: Socket | undefined = undefined

    ask = (askIF: AskIF, callback: OnQuoteIF, relayUrl: string, timeout: number = 1000 * 30) => {

        if (this.asking) {
            throw new Error("Currently requesting a quote");
        }

        this.asking = true

        this.socket = io(`${relayUrl}`, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
        })

        let connectionTimeout = setTimeout(() => {
            throw new Error('connection timed out')
          }, timeout);

        this.socket.on("quote", data => {          
            callback.OnQuote(jsonParser(data))
        })

        this.socket.on("connect", () => {
            const bridgeName = `${askIF.bridge.src_chain_id}_${askIF.bridge.dst_chain_id}_${askIF.bridge.src_token}_${askIF.bridge.dst_token}`
            this.socket?.emit("ask", bridgeName, askIF.amount);
            clearTimeout(connectionTimeout)
        })

        this.socket.on("disconnect", () => {
            this.asking = false
            clearTimeout(connectionTimeout)
        })

        this.socket.on('connect_error', (error: any) => {
            clearTimeout(connectionTimeout)
            throw new Error(error)
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected after', attemptNumber, 'attempts');
        });
    }

    stopAsk = () => {
        this.socket?.close()
    }
}
