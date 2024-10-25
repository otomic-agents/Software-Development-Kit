import { Bridge, Relay, Quote } from '../src/index';

const RELA_URL = 'https://5b4522f4.nathanielight.myterminus.com';

const bridge: Bridge = {
    bridge_id: 4,
    src_chain_id: 614,
    dst_chain_id: 614,
    src_token: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    dst_token: '0x4200000000000000000000000000000000000042',
    bridge_name: undefined,
};

const Ask = async () => {
    const relay = new Relay(RELA_URL);

    relay.ask(
        {
            bridge,
            amount: '30',
        },
        {
            OnQuote: (quote: Quote) => {
                console.log('new quote', quote);
            },
        },
    );
    
    
    setTimeout(() => {
        console.log('socket id', relay.quoteManager.getSocketId());
    }, 10 * 1000);

    setTimeout(() => relay.stopAsk(), 30 * 1000);
};

Ask();
