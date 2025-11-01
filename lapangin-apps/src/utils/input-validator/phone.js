
import {parsePhoneNumberWithError } from 'libphonenumber-js';

export default function checkPhoneNumber(phoneNumber){
    try{
        const phone = parsePhoneNumberWithError(phoneNumber);
        return  phone.isValid();
    }catch{
        return false;
    }
}