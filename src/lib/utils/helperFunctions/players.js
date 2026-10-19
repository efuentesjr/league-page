import { get } from 'svelte/store';
import {players} from '$lib/stores';
import { browser } from '$app/environment';

// bump when the shape of /api/fetch_players_info changes
const PLAYERS_INFO_VERSION = '2';

export const loadPlayers = async (servFetch, refresh = false) => {     
	if(get(players)[1426]) {
		return {
            players: get(players),
            stale: false
        };
	}

    const smartFetch = servFetch ?? fetch;
    
    const now = Math.round(new Date().getTime() / 1000);
    let playersInfo = null;
    let expiration = null;
    if(browser) {
        playersInfo = JSON.parse(localStorage.getItem("playersInfo"));
        expiration = parseInt(localStorage.getItem("expiration"));

        // cached copies made before player ages were added get replaced once
        if(localStorage.getItem("playersInfoVersion") != PLAYERS_INFO_VERSION) {
            playersInfo = null;
            expiration = null;
        }
    }

    if(playersInfo && playersInfo[1426] && expiration && now > expiration && !refresh) {
        return {
            players: playersInfo,
            stale: true
        }
    }
    
    if(!playersInfo || !expiration || now > expiration) {
        const res = await smartFetch(`/api/fetch_players_info`, {compress: true});
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data);
        }

        if(browser) {
            localStorage.setItem("playersInfo", JSON.stringify(data))

            const ts = Math.round(new Date().getTime() / 1000);
            const newExpiration = ts + (24 * 3600);

            localStorage.setItem("expiration", newExpiration)  
            localStorage.setItem("playersInfoVersion", PLAYERS_INFO_VERSION)

            players.update(() => data);
        }

        return {
            players: data,
            stale: false
        };
    }
    players.update(() => playersInfo);
    return {
        players: playersInfo,
        stale: false
    };
}