"use client";

import { useState } from "react";
import { imageUrl } from "@/lib/api";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const hasImages = images && images.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
        {hasImages ? (
          <img
            src={imageUrl(images[active])}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={`h-16 w-16 flex-shrink-0 rounded border overflow-hidden ${
                idx === active ? "border-gray-900" : "border-gray-200"
              }`}
            >
              <img src={imageUrl(img)} alt={`${name} ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
