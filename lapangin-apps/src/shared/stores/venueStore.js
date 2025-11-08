import { create } from "zustand";
import {persist} from 'zustand/middleware';

import api from '@/utils/axiosClient/axiosInterceptor.js';

const useVenueStore = create(
    persist(
        (set, get) => ({
            activeVenue: null, // venueId, venueName, 
            venueMatadata: null, // (name, slug, phone, address, description, metadata(notyet), is_active)
            setActiveVenue: (venue) => { set({ activeVenue: venue }); },
            setVenueMetadata: (metadata) => { set({ venueMatadata: metadata }); },
            resetActiveVenue: () => { set({ activeVenue: null }); },
            getVenueMetadata: async (venueId) => { // fetch venue metadata ,then sign the data in venueMatadata
                await api.get(`/venue/get_venue_info/${venueId || get().activeVenue.venueId}`)
                        .then(response => response.data.data)
                        .then(data => {
                            set({ venueMatadata: data });
                        })
            }
        }),
        {
            name: 'venue-storage'
        }
    )
) 

export default useVenueStore;