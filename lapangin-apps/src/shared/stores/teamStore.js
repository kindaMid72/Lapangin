import api from '@/utils/axiosClient/axiosInterceptor.js';
import { create } from 'zustand';

// other stores
import useVenueStore from './venueStore';

const useTeamStore = create((set, get) => ({
    team: null,
    getTeam: async () => {
        // import venueStore for venue id, incase venue 
        const { activeVenue, venueMetadata, getVenueMetadata } = useVenueStore.getState();
        const id = venueMetadata?.id || activeVenue?.venueId;
        if (!id) {
            console.error("TeamStore: Venue ID is not available.");
            return;
        }
        try {
            if (!venueMetadata) { // make sure there is a venue metadata
                await getVenueMetadata(id);
            }

            await api.get(`/team/get_team/${id}`)
                .then(res => res.data.data)
                .then(data => {
                    console.log('team data: ', data);
                    set({ team: data });
                })
                .catch(err => console.error(err));
        } catch (err) {
            console.error(err);
        }
    }
}));

export default useTeamStore; 