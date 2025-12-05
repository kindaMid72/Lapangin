import {create } from "zustand";

// this store will store a session of an active payment on hold 
const paymentStore = create((set, get) => ({
    paymentToken: null,
    

}))

export default courtStore;