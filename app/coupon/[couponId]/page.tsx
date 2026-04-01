"use client"; 
 
import { useEffect, useState } from "react"; 
import { useParams } from "next/navigation"; 
import { supabase } from "@/lib/supabase"; 
import Image from "next/image";
 
export default function CouponPage() { 
  const params = useParams<{ couponId: string }>(); 
  const couponId = params.couponId; 
 
  const [coupon, setCoupon] = useState<any>(null);  
  const [busy, setBusy] = useState(false); 
  
  const [pressing, setPressing] = useState(false);
let pressTimer: any = null;

const startPress = () => {
  setPressing(true);

  pressTimer = setTimeout(() => {
    redeem(); // ←長押し成功で実行
  }, 1500); // ←1.5秒（調整OK）
};

const cancelPress = () => {
  setPressing(false);
  if (pressTimer) {
    clearTimeout(pressTimer);
  }
};
 
  const load = async () => { 
    const { data, error } = await supabase 
      .from("coupons") 
      .select("id,title,conditions,expires_at,status,store_id") 
      .or(`id.eq.${couponId},token.eq.${couponId}`) 
      .single(); 
 
    if (error) { 
      alert("クーポンが見つかりません"); 
      return; 
    } 
    setCoupon(data); 
  }; 
 
  useEffect(() => { load(); }, []); 
 
  const redeem = async () => {
  if (!coupon || coupon.status === "redeemed") return;

  setBusy(true);

  const { error } = await supabase
    .from("coupons")
    .update({
      status: "redeemed",
      redeemed_at: new Date().toISOString(),
    })
    .eq("id", coupon.id);

  if (error) {
    alert("使用済みにできませんでした");
    setBusy(false);
    return;
  }

  await supabase.from("events").insert({
    store_id: coupon.store_id,
    coupon_id: coupon.id,
    event_name: "coupon_redeemed",
    meta: {},
  });

  await load();
  setBusy(false);
}; 
 
  if (!coupon) return <div style={{ padding: 16 }}>読み込み中...</div>; 
 
  const exp = new Date(coupon.expires_at); 
 
  return ( 
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}> 
	<div style={{ marginBottom: 12 }}>
  <Image
    src="/coupon.png"
    alt="クーポン"
    width={560}
    height={300}
    style={{
      width: "100%",
      height: "auto",
      borderRadius: 12,
      objectFit: "cover",
    }}
  />
</div>
      <h1 style={{ fontSize: 22 }}>{coupon.title}</h1> 
 
      <div
  style={{
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    background: "var(--background)",
    border: "1px solid #888"
  }}
>
  <b style={{ color: "var(--foreground)" }}>
    当日限り有効
  </b>
  <span style={{ color: "var(--foreground)", opacity: 0.8 }}>
    （〜 {exp.toLocaleString()}）
  </span>
</div>

<h2 style={{ marginTop: 16, color: "var(--foreground)" }}>
  利用条件
</h2>

<pre
  style={{
    whiteSpace: "pre-wrap",
    background: "var(--background)",
    color: "var(--foreground)",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #888"
  }}
>
  {coupon.conditions}
</pre>
 
      <div style={{ height: 12 }} /> 
      {coupon.status === "redeemed" ? ( 
        <div style={{ padding: 14, borderRadius: 12, background: "#111", color: "#fff", fontWeight: 900 }}> 
          使用済み 
        </div> 
      ) : ( 
        <> 
          <button
    onMouseDown={startPress}
    onMouseUp={cancelPress}
    onMouseLeave={cancelPress}
    onTouchStart={startPress}
    onTouchEnd={cancelPress}
    disabled={busy}
    style={{
      width: "100%",
      padding: 14,
      borderRadius: 12,
      border: 0,
      background: pressing ? "#4c306e" : "#684298",
      color: "#fff",
      fontWeight: 900,
    }}
  >
    {busy ? "処理中..." : pressing ? "長押し中..." : "長押しで使用済みにする"}
  </button>

  <p style={{ marginTop: 10, fontSize: 12, color: "#b00" }}>
    ※長押しすると使用済みになります（誤操作防止）
  </p>
        </> 
      )} 
    </div> 
  ); 
} 