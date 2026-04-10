"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function endOfTodayJSTISOString() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const jst = new Date(utc + 9 * 60 * 60_000);

  const y = jst.getFullYear();
  const m = jst.getMonth();
  const d = jst.getDate();
  const endJst = new Date(Date.UTC(y, m, d, 14, 59, 59, 999));
  return endJst.toISOString();
}

export default function BeginPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId;

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => rating !== null, [rating]);

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);

    const { data: camp, error: campErr } = await supabase
      .from("campaigns")
      .select("id, store_id, coupon_title, coupon_conditions, stores(place_id)")
      .eq("id", campaignId)
      .single();

    if (campErr || !camp) {
      alert("キャンペーンが見つかりません");
      setLoading(false);
      return;
    }

    const responseId = crypto.randomUUID();

    const { error: resErr } = await supabase
      .from("responses")
      .insert({
        id: responseId,
        store_id: camp.store_id,
        campaign_id: camp.id,
        rating,
        q1: null,
        q2: comment || null,
        feedback: (rating !== null && rating <= 3) ? (feedback || null) : null,
      });

    if (resErr) {
      alert("送信に失敗しました");
      setLoading(false);
      return;
    }

    const expiresAt = endOfTodayJSTISOString();

    const { data: coupon, error: cErr } = await supabase
      .from("coupons")
      .insert({
        response_id: responseId,
        store_id: camp.store_id,
        campaign_id: camp.id,
        title: camp.coupon_title,
        conditions: camp.coupon_conditions,
        expires_at: expiresAt,
        token: crypto.randomUUID(),
      })
      .select("id, token")
      .single();

    if (cErr || !coupon) {
      alert("クーポン発行に失敗しました");
      setLoading(false);
      return;
    }

    await supabase.from("events").insert({
      store_id: camp.store_id,
      campaign_id: camp.id,
      response_id: responseId,
      coupon_id: coupon.id,
      event_name: "survey_submitted",
      meta: { rating },
    });

    if (rating !== null && rating >= 4) {
      router.push(`/q/${campaignId}/review?couponId=${coupon.id}&responseId=${responseId}`);
    } else {
      router.push(`/coupon/${coupon.token}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>30秒アンケート</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        ご協力いただいた方に <b>当日限りのクーポン</b> を差し上げます
      </p>

      {/* ★設問1（完全復元） */}
      <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid #eee" }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          設問１：ブルーベリー狩りは楽しかったですか？（必須）
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              style={{
                fontSize: 32,
                cursor: "pointer",
                color: n <= (hover || rating || 0) ? "#684298" : "#ccc",
                transition: "0.2s",
                transform: n === rating ? "scale(1.2)" : "scale(1)",
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* ★設問2（完全復元） */}
      <div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: "1px solid #eee" }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          設問２：東金ジャンボブルーベリー農園の感想を教えてください（任意）
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="例：粒が大きくて甘かったです。スタッフの方も親切でまた来たいです！"
          style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          ※ ★4〜5の方は、上記内容のコピーをGoogleに投稿できます
        </div>
      </div>

      {/* ★改善フィードバック（完全復元） */}
      {rating !== null && rating <= 3 && (() => {
        const isDark = typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;

        return (
          <div style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 12,
            border: isDark ? "1px solid #444" : "1px solid #ddd",
          }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              より良くするため、改善点があれば教えてください（任意）
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="例：駐車場が少し分かりづらかった / 休憩スペースがあると嬉しい など"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />

            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              ※ こちらは外部に公開されません（農園改善のための内部用です）
            </div>
          </div>
        );
      })()}

      <div style={{ marginTop: 16 }}>
        <button
          disabled={!canSubmit || loading}
          onClick={submit}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: 0,
            background: "#684298",
            color: "#fff",
            fontWeight: 900,
            fontSize: 16,
            opacity: !canSubmit || loading ? 0.6 : 1,
          }}
        >
          {loading ? "送信中..." : "送信して次へ（クーポン表示）"}
        </button>
      </div>
    </div>
  );
}