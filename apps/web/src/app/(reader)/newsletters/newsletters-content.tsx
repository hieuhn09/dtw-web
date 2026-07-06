"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { Button } from "@dtw/ui";
import { subscribeGuest } from "@/lib/account-actions";
import { useT } from "@/lib/i18n";
import type { Newsletter } from "@/lib/payload-server";

const DEFAULT_PICKS = new Set(["am", "ai"]);

/** `vertical` is expanded to a full `Pillar` object at `depth: 1`; falls back
 *  to a neutral color if the relation is empty. */
function pillarColor(n: Newsletter): string {
  const v = n.vertical;
  if (v && typeof v === "object" && "color" in v && typeof v.color === "string") {
    return v.color;
  }
  return "var(--ink-2)";
}

export function NewslettersContent({ newsletters }: { newsletters: ReadonlyArray<Newsletter> }) {
  const t = useT();
  const [picks, setPicks] = useState<Set<string>>(
    () => new Set(newsletters.map((n) => n.slug).filter((slug) => DEFAULT_PICKS.has(slug)))
  );
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const toggle = (slug: string) => {
    const s = new Set(picks);
    if (s.has(slug)) s.delete(slug);
    else s.add(slug);
    setPicks(s);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const { ok } = await subscribeGuest(email, Array.from(picks));
      if (ok) setSubmitted(true);
    });
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
            fontSize: "clamp(30px, 8vw, 48px)",
            fontWeight: 650,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          {t(
            "Read Dailytechwire the way you read.",
            "Đọc Dailytechwire theo cách của bạn.",
            "Baca Dailytechwire sesuai keinginan."
          )}
        </h1>
        <p
          className="serif text-mute"
          style={{ margin: 0, fontSize: 18, lineHeight: 1.45, maxWidth: 760 }}
        >
          {t(
            "Daily briefs, weekly digests, one bi-weekly.",
            "Bản tin ngày, tổng hợp tuần, một bi-weekly.",
            "Brief harian, digest mingguan, satu dwi-mingguan."
          )}
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 18,
          marginBottom: 32,
        }}
      >
        {newsletters.map((n) => {
          const color = pillarColor(n);
          const checked = picks.has(n.slug);
          return (
            <label
              key={n.slug}
              style={{
                display: "flex",
                gap: 18,
                padding: 20,
                background: "var(--surface)",
                border: checked ? `2px solid ${color}` : "2px solid var(--hair)",
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
                  background: color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 650,
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
                    onChange={() => toggle(n.slug)}
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: color,
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    marginBottom: 6,
                  }}
                >
                  {n.cadence}
                </div>
                <p
                  style={{
                    margin: "0",
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "var(--ink-2)",
                  }}
                >
                  {n.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <form
        onSubmit={submit}
        style={{
          padding: "28px 32px",
          background: "var(--banner)",
          color: "#E8EDF7",
          borderRadius: 8,
          display: "flex",
          gap: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 4 }}>
            {picks.size}{" "}
            {t(
              `newsletter${picks.size === 1 ? "" : "s"} selected`,
              `bản tin được chọn`,
              `newsletter terpilih`
            )}
          </div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 650, color: "#FFFFFF" }}>
            {t(
              "You'll start receiving these right away — no confirmation email needed.",
              "Bạn sẽ bắt đầu nhận ngay — không cần email xác nhận.",
              "Anda akan langsung menerimanya — tanpa email konfirmasi."
            )}
          </div>
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={submitted}
          style={{
            flex: 1,
            maxWidth: 320,
            padding: "14px 16px",
            border: "1px solid rgba(232,237,247,0.20)",
            borderRadius: 5,
            background: "rgba(232,237,247,0.06)",
            color: "#E8EDF7",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
          }}
        />
        <Button
          variant="accent"
          size="lg"
          type="submit"
          disabled={pending || submitted || picks.size === 0}
          style={{ whiteSpace: "nowrap" }}
        >
          {submitted
            ? t("Subscribed →", "Đã đăng ký →", "Berlangganan →")
            : t("Subscribe", "Đăng ký", "Berlangganan")}
        </Button>
      </form>
    </div>
  );
}
