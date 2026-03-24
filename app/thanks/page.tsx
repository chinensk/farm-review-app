"use client";

import Image from "next/image";

export default function ThanksPage() {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      {/* ロゴ */}
      <div style={{ marginBottom: 24 }}>
        <Image
          src="/logo.png"
          alt="農園ロゴ"
          width={120}
          height={120}
        />
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 900 }}>
        ありがとうございました！
      </h1>

      <p style={{ marginTop: 12, color: "#666" }}>
        口コミ投稿のご協力、sありがとうございます。<br />
        またのご来園をお待ちしております！
      </p>

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