"use client"; 
 
import { useMemo, useState } from "react"; 

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

import { useRouter, useParams } from "next/navigation"; 
import { supabase } from "@/lib/supabase"; 
 
function endOfTodayJSTISOString() { 
  // “当日限り”を厳密に：日本時間の今日23:59:59.999 
  const now = new Date(); 
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000; 
  const jst = new Date(utc + 9 * 60 * 60_000); 
 
  const y = jst.getFullYear(); 
  const m = jst.getMonth(); 
  const d = jst.getDate(); 
  const endJst = new Date(Date.UTC(y, m, d, 14, 59, 59, 999)); 
  // JST 23:59:59.999 = UTC 14:59:59.999 
  return endJst.toISOString(); 
} 
 
export default function BeginPage() { 
  const router = useRouter(); 
  const params = useParams<{ campaignId: string }>(); 
  const campaignId = params.campaignId; 
 
  // 設問１：★（必須） 
  const [rating, setRating] = useState<number | null>(null); 
  // 設問２：感想（自由記述、レビュー文にも使う） 
  const [comment, setComment] = useState(""); 
  // ★1-3の改善フィードバック（任意） 
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
 
    const { data: res, error: resErr } = await supabase 
      .from("responses") 
      .insert({ 
        store_id: camp.store_id, 
        campaign_id: camp.id, 
        rating, 
        q1: null, 
        q2: comment || null, 
        feedback: rating! <= 3 ? (feedback || null) : null, 
      }) 
      .select("id") 
      .single(); 
 
    if (resErr || !res) { 
      alert("送信に失敗しました"); 
      setLoading(false); 
      return; 
    } 
 
    const expiresAt = endOfTodayJSTISOString(); 
 
    const { data: coupon, error: cErr } = await supabase
  .from("coupons")
  .insert({
    response_id: res.id,
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
      response_id: res.id, 
      coupon_id: coupon.id, 
      event_name: "survey_submitted", 
      meta: { rating }, 
    }); 
 
    if (rating! >= 4) { 
  router.push(`/q/${campaignId}/review?couponId=${coupon.id}&responseId=${res.id}`); 
} else { 
  router.push(`/coupon/${coupon.token}`); 
}
 
    setLoading(false); 
  }; 
 
  return ( 
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}> 
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>30秒アンケート</h1> 
      <p style={{ marginTop: 0, color: "#444" }}> 
        ご協力いただいた方に <b>当日限りのクーポン</b> をお渡しします。 
      </p> 
 
      <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid #eee" }}> 
        <div style={{ fontWeight: 800, marginBottom: 8 }}> 
          設問１：ブルーベリー狩りは楽しかったですか？（必須） 
        </div> 
 
        const [rating, setRating] = useState<number | null>(null);
const [hover, setHover] = useState(0);

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
        color: n <= (hover || rating || 0) ? "#f97316" : "#ccc",
        transition: "0.2s",
        transform: n === rating ? "scale(1.2)" : "scale(1)"
      }}
    >
      ★
    </span>
  ))}
</div>
      </div> 
 
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
          ※ ★4〜5の方は、この内容をそのままコピーしてGoogleマップに投稿できます。 
        </div> 
      </div> 
 
      {rating !== null && rating <= 3 && (() => {
  const isDark = typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 12,
        border: isDark ? "1px solid #444" : "1px solid #ddd",
        background: "var(--background)"
      }}
    >
      <div
        style={{
          fontWeight: 800,
          marginBottom: 8,
          color: "var(--foreground)"
        }}
      >
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
          border: isDark ? "1px solid #555" : "1px solid #ddd",
          background: "var(--background)",
          color: "var(--foreground)"
        }}
      />

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "var(--foreground)",
          opacity: 0.7
        }}
      >
        ※ こちらは外部に公開されません（農園改善のための内部用です）。
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
            background: "#f97316", 
            color: "#fff", 
            fontWeight: 900, 
            fontSize: 16, 
            opacity: !canSubmit || loading ? 0.6 : 1, 
          }} 
        > 
          {loading ? "送信中..." : "送信して次へ（クーポン表示）"} 
        </button> 
      </div> 
 
      <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}> 
        所要時間：20〜30秒 
      </div> 
    </div> 
  ); 
} 