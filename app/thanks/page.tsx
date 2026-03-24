"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ThanksPage() {
  const searchParams = useSearchParams();
  const [couponId, setCouponId] = useState<string | null>(null);

  useEffect(() => {
    setCouponId(searchParams.get("couponId"));
  }, [searchParams]);

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Image src="/logo.png" alt="logo" width={120} height={120} />
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 900 }}>
        ありがとうございました！
      </h1>

      <p style={{ marginTop: 12, color: "#666" }}>
        口コミ投稿のご協力、ありがとうございます。
        <br />
        またのご来園をお待ちしております！
      </p>

      {couponId && (
        <div style={{ marginTop: 12 }}>
          <a
            href={`/coupon/${couponId}`}
            style={{
              display: "inline-block",
              padding: "12px 20px",
              borderRadius: 12,
              background: "#16a34a",
              color: "#fff",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            クーポンを表示する
          </a>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            borderRadius: 12,
            background: "#f97316",
            color: "#fff",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          トップに戻る
        </a>
      </div>
    </div>
  );
}