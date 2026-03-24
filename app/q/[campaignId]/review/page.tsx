"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PLACE_ID = "ChIJ2ROb0Y-VImARRaOWfpI4ziA";

const WRITE_REVIEW_URL =
  `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

const MAPS_PLACE_URL =
  `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;

const MAPS_APP_TRY_URL =
  `https://www.google.com/maps?cid=&q=place_id:${PLACE_ID}`;

export default function ReviewPage() {
  const params = useParams<{ campaignId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const couponId = searchParams.get("couponId");
  const responseId = searchParams.get("responseId");

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!responseId) {
        setText("粒が大きくて甘かったです。スタッフの方も親切でまた来たいです！");
        return;
      }
      const { data, error } = await supabase
        .from("responses")
        .select("q2")
        .eq("id", responseId)
        .single();

      if (error) {
        setText("粒が大きくて甘かったです。スタッフの方も親切でまた来たいです！");
        return;
      }
      setText(
        data?.q2 && data.q2.trim()
          ? data.q2
          : "粒が大きくて甘かったです。スタッフの方も親切でまた来たいです！"
      );
    };
    load();
  }, [responseId]);

  const chips = useMemo(
    () => [
      "粒が大きい",
      "甘くて美味しい",
      "スタッフが親切",
      "子どもが喜んだ",
      "雰囲気が良い",
      "また来たい",
    ],
    []
  );

  const addChip = (chip: string) => {
    const s = text.trim();
    const next = s.length ? `${s}\n・${chip}` : `・${chip}`;
    setText(next);
  };

  const openWithFallbacks = () => {
    window.location.href = WRITE_REVIEW_URL;

    setTimeout(() => {
      window.location.href = MAPS_APP_TRY_URL;
    }, 900);

    setTimeout(() => {
      window.location.href = MAPS_PLACE_URL;
    }, 1600);
  };

  const post = async () => {
  setBusy(true);

  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {}

  await supabase.from("events").insert({
    event_name: "review_cta_clicked",
    meta: { copied },
  });

  openWithFallbacks(); // ←これだけ残す

  setBusy(false);
};

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8, color: "var(--foreground)" }}>
        最後にお願いがあります
      </h1>

      <p style={{ marginTop: 0, color: "var(--foreground)", opacity: 0.85 }}>
        あなたの口コミが、次に来るお客様の安心になります。<br />
        <b>ボタンを押すと投稿文がコピー</b>され、Googleマップが開きます。
      </p>

      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          border: "1px solid #888",
          background: "var(--background)",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8, color: "var(--foreground)" }}>
          投稿内容（編集は任意）
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #888",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => addChip(c)}
              style={{
                border: "1px solid #888",
                borderRadius: 999,
                padding: "6px 10px",
                background: "var(--background)",
                color: "var(--foreground)",
                cursor: "pointer",
              }}
            >
              + {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <button
          onClick={post}
          disabled={busy}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: 0,
            background: "#f97316",
            color: "#fff",
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          {busy ? "起動中..." : "Googleで口コミを書く（自動コピー）"}
        </button>

        {couponId && (
          <button
            onClick={() => router.push(`/coupon/${couponId}`)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #888",
              background: "var(--background)",
              color: "var(--foreground)",
              marginTop: 10,
              fontWeight: 800,
            }}
          >
            クーポンを見る
          </button>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
        貼り付け方法：Google画面で長押し →「貼り付け」→ 投稿
      </div>
    </div>
  );
}