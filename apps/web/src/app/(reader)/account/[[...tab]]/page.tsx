"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button, PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { Icon } from "@/components/icons";
import { TimeAgo } from "@/components/time-ago";
import {
  ARTICLES,
  NEWSLETTERS,
  PILLARS,
  type PillarId,
} from "@/lib/data";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";

type TabKey = "saved" | "history" | "following" | "newsletters" | "settings";

const TABS: ReadonlyArray<readonly [TabKey, string]> = [
  ["saved", "Saved"],
  ["history", "Reading history"],
  ["following", "Following"],
  ["newsletters", "Newsletters"],
  ["settings", "Settings"],
];

function AccountSaved() {
  const saved = ARTICLES.slice(2, 7);
  const t = useT();
  const { lang } = useLang();
  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 18,
        }}
      >
        <h2
          className="serif"
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.015em",
          }}
        >
          {t("Saved articles", "Bài đã lưu", "Artikel tersimpan")}
        </h2>
        <span className="text-mute mono" style={{ fontSize: 11 }}>
          {saved.length} {t("saved · synced across 3 devices", "đã lưu · đồng bộ 3 thiết bị", "tersimpan · sync 3 perangkat")}
        </span>
      </div>
      <div style={{ display: "grid", gap: 0 }}>
        {saved.map((a, i) => (
          <Link
            key={a.id}
            href={`/article/${a.slug}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <article
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: 18,
                padding: "16px 0",
                borderBottom: i < saved.length - 1 ? "1px solid var(--hair)" : "none",
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <CoverArt
                pillar={a.pillar}
                seed={a.id}
                variant={(i + 1) % 6}
                height={66}
              />
              <div>
                <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
                <div
                  className="serif"
                  style={{ fontSize: 16, fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}
                >
                  {a.title}
                </div>
                <div className="text-mute" style={{ fontSize: 11, marginTop: 4 }}>
                  {t("Saved", "Đã lưu", "Tersimpan")}{" "}
                  <TimeAgo iso={a.published} /> · {a.readMin} min
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="bookmark" size={12} /> {t("Remove", "Bỏ", "Hapus")}
              </Button>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AccountHistory() {
  const hist = ARTICLES.slice(0, 6);
  const t = useT();
  const { lang } = useLang();
  return (
    <section>
      <h2
        className="serif"
        style={{
          margin: "0 0 18px",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.015em",
        }}
      >
        {t("Reading history", "Lịch sử đọc", "Riwayat baca")}
      </h2>
      <div className="mono text-mute-2" style={{ fontSize: 11, marginBottom: 14 }}>
        {t(
          "We use this to recommend, and to reset your free-article meter. Clear any time.",
          "Chúng tôi dùng để gợi ý và đặt lại meter bài miễn phí. Có thể xoá bất cứ lúc nào.",
          "Kami pakai untuk rekomendasi dan reset meter artikel gratis. Bisa dihapus kapan saja."
        )}
      </div>
      {hist.map((a, i) => (
        <Link
          key={a.id}
          href={`/article/${a.slug}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < hist.length - 1 ? "1px solid var(--hair)" : "none",
              cursor: "pointer",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
              <span style={{ fontSize: 13 }}>{a.title}</span>
            </div>
            <span className="mono text-mute" style={{ fontSize: 11 }}>
              <TimeAgo iso={a.published} />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

function AccountFollowing() {
  const t = useT();
  const { lang } = useLang();
  const [following, setFollowing] = useState<Set<PillarId>>(
    new Set<PillarId>(["ai", "asia"])
  );
  const toggle = (id: PillarId) => {
    const s = new Set(following);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setFollowing(s);
  };
  return (
    <section>
      <h2
        className="serif"
        style={{
          margin: "0 0 8px",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.015em",
        }}
      >
        {t("Following", "Đang theo dõi", "Diikuti")}
      </h2>
      <div className="text-mute" style={{ fontSize: 13, marginBottom: 18 }}>
        {t(
          "Followed pillars sync to your home tab and your offline cache (20 recent stories each).",
          "Chuyên mục theo dõi đồng bộ với trang chủ và cache offline (20 bài gần nhất mỗi mục).",
          "Pilar yang diikuti sync ke beranda dan cache offline (20 artikel terbaru tiap pilar)."
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 12,
        }}
      >
        {PILLARS.map((p) => {
          const on = following.has(p.id);
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                background: "var(--surface)",
                border: "1px solid var(--hair)",
                borderRadius: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: p.color,
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {localizedPillarLabel(p.id, lang)}
                </span>
              </div>
              <Button
                variant={on ? "primary" : "outline"}
                size="sm"
                onClick={() => toggle(p.id)}
              >
                {on ? t("Following", "Đang theo dõi", "Diikuti") : t("Follow", "Theo dõi", "Ikuti")}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AccountNewsletters() {
  const t = useT();
  return (
    <section>
      <h2
        className="serif"
        style={{
          margin: "0 0 18px",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.015em",
        }}
      >
        {t("Your newsletters", "Bản tin của bạn", "Newsletter Anda")}
      </h2>
      {NEWSLETTERS.slice(0, 3).map((n, i) => (
        <div
          key={n.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 0",
            borderBottom: i < 2 ? "1px solid var(--hair)" : "none",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{n.name}</div>
            <div className="text-mute mono" style={{ fontSize: 11 }}>
              {n.cadence}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm">
              {t("Pause", "Tạm dừng", "Jeda")}
            </Button>
            <Button variant="ghost" size="sm" style={{ color: "var(--down)" }}>
              {t("Unsubscribe", "Hủy đăng ký", "Berhenti")}
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}

function AccountSettings() {
  const t = useT();
  const rows: ReadonlyArray<readonly [string, string, string]> = [
    [t("Appearance", "Giao diện", "Tampilan"), "Light / Dark / System", "Light"],
    [t("Language", "Ngôn ngữ", "Bahasa"), "Site, newsletters, dashboards", "English"],
    [t("Region", "Vùng", "Wilayah"), "Date / currency / number", "Singapore"],
    [t("Email", "Email", "Email"), "Where we send your magic links", "reader@gmail.com"],
    [t("Two-factor", "Xác thực 2 lớp", "Dua-faktor"), "Required for editor/admin", "Off"],
    [
      t("Data export", "Xuất dữ liệu", "Ekspor data"),
      "Download your data (GDPR/PDPA)",
      "Request export",
    ],
  ];
  return (
    <section>
      <h2
        className="serif"
        style={{
          margin: "0 0 18px",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.015em",
        }}
      >
        {t("Preferences", "Tuỳ chọn", "Preferensi")}
      </h2>
      {rows.map(([k, desc, v]) => (
        <div
          key={k}
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr auto",
            gap: 14,
            padding: "16px 0",
            borderBottom: "1px solid var(--hair)",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600 }}>{k}</div>
          <div className="text-mute" style={{ fontSize: 12 }}>
            {desc}
          </div>
          <Button variant="outline" size="sm">
            {v}
          </Button>
        </div>
      ))}
    </section>
  );
}

function isTab(s: string): s is TabKey {
  return TABS.some(([k]) => k === s);
}

export default function AccountPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>;
}) {
  const { tab: tabSeg } = use(params);
  const t = useT();
  const { user } = useShell();
  const tab = tabSeg?.[0];
  const active: TabKey = tab && isTab(tab) ? tab : "saved";

  if (!user) {
    return (
      <div
        className="container"
        style={{ paddingTop: 48, paddingBottom: 48, textAlign: "center" }}
      >
        <h2 className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
          {t(
            "Log in to view your account.",
            "Đăng nhập để xem tài khoản.",
            "Masuk untuk lihat akun Anda."
          )}
        </h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <header
        style={{
          borderBottom: "1px solid var(--hair)",
          paddingBottom: 24,
          marginBottom: 24,
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "var(--font-serif)",
          }}
        >
          {user.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1
            className="serif"
            style={{
              margin: "0 0 4px",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {user.name}
          </h1>
          <div className="text-mute" style={{ fontSize: 13 }}>
            <span className="mono">{user.email}</span>{" "}
            ·{" "}
            {t("joined May 2026", "tham gia 5/2026", "bergabung Mei 2026")} ·{" "}
            <span
              style={{
                padding: "2px 8px",
                background: "var(--surface-2)",
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {user.role}
            </span>
          </div>
        </div>
        <Button variant="accent">
          {t("Upgrade to Pro · $12/mo", "Nâng cấp Pro · $12/tháng", "Upgrade ke Pro · $12/bulan")}
        </Button>
      </header>

      <div className="r-sidebar" style={{ display: "grid", gap: 36 }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TABS.map(([k, l]) => (
            <Link
              key={k}
              href={k === "saved" ? "/account" : `/account/${k}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                background: active === k ? "var(--ink)" : "transparent",
                color: active === k ? "var(--paper)" : "var(--ink)",
                borderRadius: 5,
                fontSize: 13,
                textAlign: "left",
                textDecoration: "none",
              }}
            >
              {l}
              {active === k && <span>→</span>}
            </Link>
          ))}
        </nav>

        <div>
          {active === "saved" && <AccountSaved />}
          {active === "history" && <AccountHistory />}
          {active === "following" && <AccountFollowing />}
          {active === "newsletters" && <AccountNewsletters />}
          {active === "settings" && <AccountSettings />}
        </div>
      </div>
    </div>
  );
}
