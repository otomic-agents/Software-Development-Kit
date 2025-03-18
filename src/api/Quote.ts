import { Socket, io } from 'socket.io-client';

import { AskIF } from '../interface/interface';
import { OnQuoteIF } from '../interface/interface';
import { jsonParser } from '../utils/data';
import { sleep } from '../utils/sleep';
export class QuoteManager {
    asking: boolean = false;
    socket: Socket | undefined = undefined;
    reconnectionAttempts: number = 0;
    maxReconnectAttempts: number = 8;
    reconnectInterval: number = 1000;
    gotQuote: boolean = false;

    ask = (askIF: AskIF, callback: OnQuoteIF, relayUrl: string, timeout: number = 1000 * 30) => {
        if (this.asking) {
            throw new Error('Currently requesting a quote');
        }

        this.asking = true;
        this.gotQuote = false;
        this.socket = io(`${relayUrl}`, { transports: ['websocket'] });

        let connectionTimeout = setTimeout(() => {
            throw new Error('connection timed out');
        }, timeout);

        this.socket.on('quote', (data) => {
            callback.OnQuote(jsonParser(data));
            this.gotQuote = true;
        });

        this.socket.on('quote_info', (data) => {
            console.log('quote_info:', data);
        });

        this.socket.on('connect', () => {
            if (!this.gotQuote) {
                const bridgeName = `${askIF.bridge.src_chain_id}_${askIF.bridge.dst_chain_id}_${askIF.bridge.src_token}_${askIF.bridge.dst_token}`;
                this.socket?.emit('ask', bridgeName, askIF.amount);
                console.log('Sent a ask quote message');
                clearTimeout(connectionTimeout);
            }
            console.log('Connected to server');
            this.reconnectionAttempts = 0;
        });

        this.socket.on('disconnect', async (reason) => {
            this.asking = false;
            clearTimeout(connectionTimeout);
            console.log('Disconnected:', reason);
            await this.tryReconnect();
        });

        this.socket.on('connect_error', async (error: any) => {
            clearTimeout(connectionTimeout);
            console.error('connect error:', error);
            await this.tryReconnect();
        });

        this.socket.on('error', async (error: any) => {
            clearTimeout(connectionTimeout);
            console.error('error:', error);
            await this.tryReconnect();
        });
    };

    tryReconnect = async () => {
        if (this.socket) {
            this.socket.close();
            this.reconnectionAttempts += 1;
            console.log('Reconnecting', this.reconnectionAttempts);
            if (this.reconnectionAttempts <= this.maxReconnectAttempts) {
                let waitTime = this.reconnectInterval * Math.pow(2, this.reconnectionAttempts);
                console.log('Waiting', waitTime, 'ms before reconnecting');
                await sleep(waitTime);
                this.socket.connect();
            } else {
                console.log('Max reconnection attempts reached');
                throw new Error('failed to connect relay server');
            }
        }
    };

    stopAsk = () => {
        this.socket?.close();
    };

    getSocketId = () => {
        if (!this.socket) {
            return undefined;
        }
        return this.socket.id;
    };
}
