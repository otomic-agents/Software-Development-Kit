import { Bridge, Relay } from '../src/index'

const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud'

const GetBridge = async () => {
    try {
        const bridges: Bridge[] = await new Relay(RELA_URL).getBridge()
        console.log('bridges', bridges)
    } catch (error) {
        console.error(error)
    }
    
}

GetBridge()
