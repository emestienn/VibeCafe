"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function CafeGallery({
  images,
  name,
}: {
  images: { url: string; alt: string }[];
  name: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const shown = images.slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-3xl sm:grid-rows-2" style={{ height: "clamp(280px, 48vw, 460px)" }}>
        <button
          onClick={() => setOpenIndex(0)}
          className="group relative col-span-4 row-span-2 overflow-hidden sm:col-span-2"
        >
          <Image
            src={shown[0]?.url}
            alt={shown[0]?.alt ?? name}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
        {shown.slice(1, 5).map((img, i) => (
          <button
            key={img.url}
            onClick={() => setOpenIndex(i + 1)}
            className="group relative col-span-2 hidden overflow-hidden sm:block"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-espresso-deep/50 text-sm font-semibold text-cream">
                +{images.length - 5} more
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setOpenIndex(0)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:hidden"
      >
        <Expand className="size-3.5" /> View all {images.length} photos
      </button>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{name} photos</DialogTitle>
          {openIndex !== null && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image src={images[openIndex].url} alt={images[openIndex].alt} fill className="object-cover" sizes="90vw" />
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setOpenIndex(i)}
                className={`relative size-16 shrink-0 overflow-hidden rounded-lg ${openIndex === i ? "ring-2 ring-accent" : "opacity-70"}`}
              >
                <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
