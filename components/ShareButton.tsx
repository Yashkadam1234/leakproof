"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  slug: string;
}

export default function ShareButton({ slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = `${window.location.origin}/audit/${slug}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
    >
      {copied ? "Copied!" : "Copy share link"}
    </Button>
  );
}