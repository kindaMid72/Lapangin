'use client'
import { useRef } from "react";

export default function ImageInput({ onProcessed , className}) {
const inputRef = useRef(null);

async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const processed = await processImageFile(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85
    });

    onProcessed?.(processed);
}

return (
    <input
        className={className}
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
    />
);
}

// helpers
async function processImageFile(file, opts) {
    const { maxWidth, maxHeight, quality } = opts;

    const url = URL.createObjectURL(file);
    try {
        const img = await loadImage(url);
        const [w, h] = fit(img.width, img.height, maxWidth, maxHeight);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);

        const blob = await encodeBest(canvas, quality);

        const ext = blob.type.includes("webp") ? "webp" : "jpg";
        const newName = file.name.replace(/\.[^.]*$/, "") + "." + ext;

        return new File([blob], newName, { type: blob.type });
    } finally {
        URL.revokeObjectURL(url);
    }
}

function loadImage(url) {
return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Gagal load image"));
    img.src = url;
});
}

function fit(w, h, maxW, maxH) {
if (w <= maxW && h <= maxH) return [w, h];
const r = Math.min(maxW / w, maxH / h);
return [Math.round(w * r), Math.round(h * r)];
}

function encodeBest(canvas, quality) {
const mimes = ["image/webp", "image/jpeg"];
return new Promise(async (resolve, reject) => {
    for (const mime of mimes) {
    const blob = await new Promise((r) =>
        canvas.toBlob(r, mime, quality)
    );
    if (blob) return resolve(blob);
    }
    reject(new Error("Encoding failed"));
});
}
