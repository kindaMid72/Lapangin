
export function encodeObjectToBase64(target){ // pass test

    return Buffer.from(JSON.stringify(target)).toString('base64');

}
export function decodeBase64ToObject(target){ //
    
    return JSON.parse(Buffer.from(target, 'base64').toString('utf-8'));
}