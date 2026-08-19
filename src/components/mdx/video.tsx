"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type VideoProps = {
  id: string;
  title: string;
};

export function Video({ id, title }: VideoProps) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  return (
    <figure className="my-6">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated">
        {active ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="relative h-full w-full cursor-pointer"
            onClick={() => setActive(true)}
            aria-label={`${title} abspielen`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover"
              width={480}
              height={270}
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-bg-void/35">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neon-cyan text-bg-void">
                <Play aria-hidden={true} size={28} fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 font-mono text-xs text-fg-muted">{title}</figcaption>
    </figure>
  );
}
