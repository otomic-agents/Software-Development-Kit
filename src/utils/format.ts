import bs58 from "bs58";

export function isBase58String(str: string): boolean {
    try {
        // Attempt to decode the string
        bs58.decode(str);
        return true;
    } catch (error) {
        return false;
    }
}

export function toBs58Address(address: string): string {
    // is bs58 address
    try {
        bs58.decode(address);
        return address;
    } catch (e) {
        // is hex address
        let addressHex = removePrefix0x(address);
        let addressBs58 = bs58.encode(Buffer.from(addressHex, "hex"));
        return addressBs58;
    }
}

export function removePrefix0x(address: string): string {
    return address.startsWith("0x") ? address.slice(2) : address;
}