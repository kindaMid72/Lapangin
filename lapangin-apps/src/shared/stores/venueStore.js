import { create } from "zustand";
import {persist} from 'zustand/middleware';

const useVenueStore = create(
    persist(
        (set, get) => ({
            activeVenue: null, // venueId, venueName, 
            setActiveVenue: (venue) => { set({ activeVenue: venue }); },
            resetActiveVenue: () => { set({ activeVenue: null }); }
        }),
        {
            name: 'venue-storage'
        }
    )
) 

export default useVenueStore;