import { Bridge, Relay, assistive } from '../src/index'

const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud'
const NETWORK = 'mainnet'
const RPCS = {}

const GetBridge = async () => {
    try {
        const bridges: Bridge[] = await new Relay(RELA_URL).getBridge()
        console.log('bridges', bridges)

        const translateBridges = await assistive.TranslateBridge(bridges, NETWORK, RPCS)
        console.log('translateBridges', translateBridges)
    } catch (error) {
        console.error(error)
    }
    
}

GetBridge()
