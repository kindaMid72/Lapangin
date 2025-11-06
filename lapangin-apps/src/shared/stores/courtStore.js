import {create} from 'zustand';

const courtStore = create((set, get) => ({
    courts: {}, // store active courts for active venue, store court metadata in key value format
    setCourt: (court) => { // set specific court 
        set(
            {
                courts: { 
                    ...get().courts, [court.id]: court
                }
            }
        )
    },
    setAllCourt: (courts) => { // use this for initial state after fetching all court metadata from database
        set({ courts });
    }

}))

export default courtStore;