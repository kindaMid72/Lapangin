import { create } from "zustand";
import {persist} from 'zustand/middleware';

const useVenueStore = create(
    persist(
        (set, get) => ({
        activeVenue: null,
        setActiveVenue: (venue) => { set({ activeVenue: venue }); },
        resetActiveVenue: () => { set({ activeVenue: null }); }
        }),
        {
            name: 'venue-storage'
        }
    )
) 

export default useVenueStore;