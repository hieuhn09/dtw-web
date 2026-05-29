"use client";

import { useState } from "react";
import { Button } from "@dtw/ui";
import { NEWSLETTERS, pillarOf } from "@/lib/data";
import { useT } from "@/lib/i18n";

export default function NewslettersPage() {
  const t = useT();
  const [picks, setPicks] = useState<Set<string>>(new Set(["am", "ai"]));
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    const s = new Set(picks);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setPicks(s);
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <header
        style={{
          borderBottom: "2px solid var(--hair-2)",
          paddingBottom: 20,
          marginBottom: 32,
        }}
      >
        <div className="kicker" style={{ marginBottom: 6 }}>
          {t(
            "Newsletters · 6 picks · all free",
            "Bản tin · 6 lựa chọn · miễn phí",
            "Newsletter · 6 pilihan · gratis"
          )}
        </div>
        <h1
          className="serif"
          style={{
            margin: "0 0 10px",
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          {t(
            "Read DailyTechWire the way you read.",
            "Đọc DailyTechWire theo cách của bạn.",
            "Baca DailyTechWire sesuai keinginan."
          )}
        </h1>
        <p
          className="serif text-mute"
          style={{ margin: 0, fontSize: 18, lineHeight: 1.45, maxWidth: 760 }}
        >
          {t(
            "Daily briefs, weekly digests, one bi-weekly. Double opt-in. No tracking pixels. One-click unsubscribe.",
            "Bản tin ngày, tổng hợp tuần, một bi-weekly. Xác nhận kép. Không pixel theo dõi. Hủy chỉ một cú nhấp.",
            "Brief harian, digest mingguan, satu dwi-mingguan. Konfirmasi ganda. Tanpa piksel pelacak. Berhenti dengan satu klik."
          )}
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18,
          marginBottom: 32,
        }}
      >
        {NEWSLETTERS.map((n) => {
          const p = pillarOf(n.pillar);
          const checked = picks.has(n.id);
          return (
            <label
              key={n.id}
              style={{
                display: "flex",
                gap: 18,
                padding: 20,
                background: "var(--surface)",
                border: checked ? `2px solid ${p.color}` : "2px solid var(--hair)",
                borderRadius: 8,
                cursor: "pointer",
                transition: "border-color .15s",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: p.color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {n.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 4,
                  }}
                >
                  <div
                    className="serif"
                    style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em" }}
                  >
                    {n.name}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(n.id)}
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: p.color,
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: p.color,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    marginBottom: 6,
                  }}
                >
                  {n.cadence}
                </div>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "var(--ink-2)",
                  }}
                >
                  {n.desc}
                </p>
                <div className="text-mute-2 mono" style={{ fontSize: 11 }}>
                  {n.subs} {t("subscribers · sample issue →", "người đăng ký · xem mẫu →", "pelanggan · contoh →")}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        style={{
          padding: "28px 32px",
          background: "var(--ink)",
          color: "var(--paper)",
          borderRadius: 8,
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 4 }}>
            {picks.size}{" "}
            {t(
              `newsletter${picks.size === 1 ? "" : "s"} selected`,
              `bản tin được chọn`,
              `newsletter terpilih`
            )}
          </div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>
            {t(
              "One confirmation email per newsletter. We'll send them all at once.",
              "Một email xác nhận mỗi bản tin. Chúng tôi sẽ gửi cùng lúc.",
              "Satu email konfirmasi per newsletter. Kami kirim sekaligus."
            )}
          </div>
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          style={{
            flex: 1,
            maxWidth: 320,
            padding: "14px 16px",
            border: "1px solid color-mix(in oklab, var(--paper) 20%, transparent)",
            borderRadius: 5,
            background: "color-mix(in oklab, var(--paper) 6%, transparent)",
            color: "var(--paper)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
          }}
        />
        <Button
          variant="accent"
          size="lg"
          type="submit"
          style={{ whiteSpace: "nowrap" }}
        >
          {submitted
            ? t("Check your inbox →", "Kiểm tra hộp thư →", "Cek inbox →")
            : t("Subscribe", "Đăng ký", "Berlangganan")}
        </Button>
      </form>
    </div>
  );
}
