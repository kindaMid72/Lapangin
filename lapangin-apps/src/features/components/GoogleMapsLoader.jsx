'use client';
import { useEffect } from "react";

function GoogleMapsLoader() {
    const g = {
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      v: "weekly",
    };

    const m = document;
    const b = window;
    const c = "google";
    const l = "importLibrary";
    const q = "__ib__";
    const d = (b[c] = b[c] || {});
    const maps = (d.maps = d.maps || {});
    const r = new Set();
    const e = new URLSearchParams();

    const u = () =>
      new Promise(async (resolve, reject) => {
        const a = m.createElement("script");
        e.set("libraries", [...r] + "");
        for (let k in g) {
          e.set(
            k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
            g[k]
          );
        }
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        maps[q] = resolve;
        a.onerror = () => reject(Error("Google Maps API could not load."));
        m.head.append(a);
      });

    if (!maps[l]) {
      maps[l] = (f, ...n) => r.add(f) && u().then(() => maps[l](f, ...n));
    }
  return null; // loader tidak render apa-apa
}

export default GoogleMapsLoader;