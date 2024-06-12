
export const jsonParser = (src: string) => {
    let parsed = JSON.parse (src);
    if (typeof parsed === 'string') parsed = jsonParser(parsed);
    return parsed;
}