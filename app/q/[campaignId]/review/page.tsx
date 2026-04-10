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

  // 👇 追加（URLからも受け取る）
  const commentParam = searchParams.get("comment");

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {

      // ✅ ① URLにcommentがあれば最優先
      if (commentParam) {
        setText(commentParam);
        return;
      }

      // ✅ ② なければDB
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
  }, [responseId, commentParam]);

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

    openWithFallbacks();
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>
        ご協力ありがとうございます！
      </h1>

      <p>
        紫のボタンを押すとコピー＆Googleが開きます
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={{ width: "100%", padding: 12 }}
      />

      <button onClick={post} disabled={busy}>
        投稿する
      </button>

      {couponId && (
        <button onClick={() => router.push(`/coupon/${couponId}`)}>
          クーポン表示
        </button>
      )}
    </div>
  );
}