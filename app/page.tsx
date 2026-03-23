"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 👇 任意のcampaignIdに変更
    router.replace("/q/b0dd1a67-3794-4a39-8048-582716a24a25/begin");
  }, []);

  return <div style={{ padding: 20 }}>リダイレクト中...</div>;
}