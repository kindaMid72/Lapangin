import { create } from "zustand";
import {persist} from 'zustand/middleware';

import api from '@/utils/axiosClient/axiosInterceptor.js';

import { useParams } from "next/navigation";

const useVenueStore = create(
    persist(
        (set, get) => ({
            activeVenue: null, // venueId, venueName, 
            venueMetadata: null, // id, name, slug, phone, address, description, is_active, email, timezone
            setActiveVenue: (venue) => { set({ activeVenue: venue }); },
            setVenueMetadata: (metadata) => { set({ venueMatadata: metadata }); },
            resetActiveVenue: () => { set({ activeVenue: null }); },
            setActiveVenueId: async () => {
                const {venue_id} = useParams();
                set({activeVenue: {...activeVenue, venueId: venue_id}});
            },
            getVenueMetadata: async (venueId) => { // fetch venue metadata ,then sign the data in venueMatadata
                await api.get(`/venue/get_venue_info/${venueId || get().activeVenue.venueId}`)
                        .then(response => response.data.data)
                        .then(data => {
                            // PASS
                            set({ venueMetadata: data });
                        })
                        .catch(err => console.error(err))
            }
        }),
        {
            name: 'venue-storage'
        }
    )
) 

export default useVenueStore;