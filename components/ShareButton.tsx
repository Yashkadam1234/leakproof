"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  slug: string;
}

export default function ShareButton({
  slug,
}: ShareButtonProps) {
  const [copied, setCopied] =
    useState(false);

  const [isSharing, setIsSharing] =
    useState(false);

  async function handleShare() {
    try {
      setIsSharing(true);

      const shareUrl = `${window.location.origin}/audit/${slug}`;

      /**
       * Mobile/native share support.
       */
      if (
        typeof navigator !==
          "undefined" &&
        navigator.share
      ) {
        await navigator.share({
          title:
            "Leakproof AI Spend Audit",
          text:
            "See how much this team could save on AI tools.",
          url: shareUrl,
        });

        return;
      }

      /**
       * Desktop fallback:
       * copy link to clipboard.
       */
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Share failed:",
        error
      );
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      disabled={isSharing}
      className="h-11 rounded-xl border-neutral-200 px-5 transition-all hover:bg-neutral-100"
    >
      {copied ? (
        <span className="flex items-center gap-2 text-green-600">
          <Check className="h-4 w-4" />
          Copied!
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share report
        </span>
      )}
    </Button>
  );
}