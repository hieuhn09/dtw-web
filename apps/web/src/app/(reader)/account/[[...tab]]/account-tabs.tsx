"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { Icon } from "@/components/icons";
import { TimeAgo } from "@/components/time-ago";
import type { NavPillar } from "@/lib/data";
import { useLang, useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";
import {
  clearHistory,
  removeBookmark,
  setNewsletter,
  toggleFollow,
} from "@/lib/account-actions";
import type { ArticleView } from "@/lib/article-view";
import type { Newsletter } from "@/lib/cms-client";
import type { SessionUser } from "@/lib/session";
import { SettingsTab } from "./settings-tab";
import { ACCOUNT_TABS, type AccountTab } from "./tabs";

/**
 * Client half of `/account`: the parent RSC (`page.tsx`) gates on a real
 * session and fetches all list data server-side; everything below is
 * presentational + a small optimistic-mutation island per row, mirroring
 * brief-asia-web's `account-tabs.tsx` pattern (setState immediately, fire
 * `void serverAction()`, reconcile with `router.refresh()`).
 *
 * `AccountNewsletters` reads real Payload newsletter docs + real
 * subscription state (Stage D) via `setNewsletter`, mirroring this file's own
 * `AccountFollowing` optimistic-toggle pattern. Settings lives in the sibling
 * `SettingsTab` component (`./settings-tab.tsx`).
 *
 * `AccountTab` / `ACCOUNT_TABS` / `isAccountTab()` live in the sibling
 * `./tabs.ts` (no "use client") so the server-only `page.tsx` RSC can call
 * `isAccountTab()` without importing a function from this "use client"
 * module — see that file's docstring for why this split exists.
 */

/** Rendered by the `/account` RSC when there is no session — inline prompt,
 *  no redirect (HTTP 200), matching the pre-existing copy/shape. */
export function AccountSignInPrompt() {
  const t = useT();
  const { openAuth } = useShell();
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48, textAlign: "center" }}>
      <h2 className="serif" style={{ fontSize: 30, fontWeight: 600, marginBottom: 20 }}>
        {t(
          "Log in to view your account.",
          "Đăng nhập để xem tài khoản.",
          "Masuk untuk lihat akun Anda."
        )}
      </h2>
      <Button variant="accent" size="lg" onClick={openAuth}>
        {t("Log in", "Đăng nhập", "Masuk")}
      </Button>
    </div>
  );
}

function capitalize(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-mute" style={{ fontSize: 14, padding: "48px 0", textAlign: "center" }}>
      {text}
    </div>
  );
}

export interface AccountShellProps {
  user: SessionUser;
  active: AccountTab;
  saved: ArticleView[];
  history: ArticleView[];
  navPillars: ReadonlyArray<NavPillar>;
  followedSlugs: ReadonlyArray<string>;
  newsletters: ReadonlyArray<Newsletter>;
  subscribedNewsletterIds: ReadonlyArray<string>;
}

export function AccountShell({
  user,
  active,
  saved,
  history,
  navPillars,
  followedSlugs,
  newsletters,
  subscribedNewsletterIds,
}: AccountShellProps) {
  const t = useT();

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
            fontWeight: 650,
            fontFamily: "var(--font-serif)",
          }}
        >
          {(user.name[0] ?? "?").toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1
            className="serif"
            style={{
              margin: "0 0 4px",
              fontSize: 32,
              fontWeight: 650,
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
              {capitalize(user.role)}
            </span>
          </div>
        </div>
      </header>

      <div className="r-sidebar" style={{ display: "grid", gap: 36 }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ACCOUNT_TABS.map(([k, l]) => (
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
          {active === "saved" && <AccountSaved saved={saved} />}
          {active === "history" && <AccountHistory history={history} />}
          {active === "following" && (
            <AccountFollowing navPillars={navPillars} followedSlugs={followedSlugs} />
          )}
          {active === "newsletters" && (
            <AccountNewsletters newsletters={newsletters} subscribedIds={subscribedNewsletterIds} />
          )}
          {active === "settings" && <SettingsTab email={user.email} />}
        </div>
      </div>
    </div>
  );
}

function AccountSaved({ saved }: { saved: ArticleView[] }) {
  const t = useT();
  const router = useRouter();
  const [items, setItems] = useState(saved);
  const [pending, startTransition] = useTransition();

  const remove = (articleId: string) => {
    setItems((xs) => xs.filter((x) => x.id !== articleId));
    startTransition(async () => {
      await removeBookmark(articleId);
      router.refresh();
    });
  };

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
            fontWeight: 650,
            letterSpacing: "-0.015em",
          }}
        >
          {t("Saved articles", "Bài đã lưu", "Artikel tersimpan")}
        </h2>
        <span className="text-mute mono" style={{ fontSize: 11 }}>
          {items.length}{" "}
          {t("saved · synced across 3 devices", "đã lưu · đồng bộ 3 thiết bị", "tersimpan · sync 3 perangkat")}
        </span>
      </div>
      {items.length === 0 ? (
        <EmptyState
          text={t(
            "No saved articles yet. Tap Save on any story.",
            "Chưa có bài đã lưu. Bấm Lưu ở bất kỳ bài nào.",
            "Belum ada artikel tersimpan. Ketuk Simpan di artikel mana pun."
          )}
        />
      ) : (
        <div style={{ display: "grid", gap: 0 }}>
          {items.map((a, i) => (
            <div key={a.id} style={{ opacity: pending ? 0.7 : 1 }}>
              <Link
                href={`/article/${a.slug}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <article
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr auto",
                    gap: 18,
                    padding: "16px 0",
                    borderBottom: i < items.length - 1 ? "1px solid var(--hair)" : "none",
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                >
                  <CoverArt pillar={a.pillar} seed={a.id} variant={(i + 1) % 6} height={66} />
                  <div>
                    <PillarTag id={a.pillar} label={a.pillarLabel} />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(a.id);
                    }}
                  >
                    <Icon name="bookmark" size={12} /> {t("Remove", "Bỏ", "Hapus")}
                  </Button>
                </article>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AccountHistory({ history }: { history: ArticleView[] }) {
  const t = useT();
  const router = useRouter();
  const [items, setItems] = useState(history);
  const [, startTransition] = useTransition();

  const clear = () => {
    setItems([]);
    startTransition(async () => {
      await clearHistory();
      router.refresh();
    });
  };

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
            fontWeight: 650,
            letterSpacing: "-0.015em",
          }}
        >
          {t("Reading history", "Lịch sử đọc", "Riwayat baca")}
        </h2>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <Icon name="close" size={12} /> {t("Clear history", "Xoá lịch sử", "Hapus riwayat")}
          </Button>
        )}
      </div>
      <div className="mono text-mute-2" style={{ fontSize: 11, marginBottom: 14 }}>
        {t(
          "We use this to recommend, and to reset your free-article meter. Clear any time.",
          "Chúng tôi dùng để gợi ý và đặt lại meter bài miễn phí. Có thể xoá bất cứ lúc nào.",
          "Kami pakai untuk rekomendasi dan reset meter artikel gratis. Bisa dihapus kapan saja."
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState
          text={t(
            "No reading history yet.",
            "Chưa có lịch sử đọc.",
            "Belum ada riwayat baca."
          )}
        />
      ) : (
        items.map((a, i) => (
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
                borderBottom: i < items.length - 1 ? "1px solid var(--hair)" : "none",
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <PillarTag id={a.pillar} label={a.pillarLabel} />
                <span style={{ fontSize: 13 }}>{a.title}</span>
              </div>
              <span className="mono text-mute" style={{ fontSize: 11 }}>
                <TimeAgo iso={a.published} />
              </span>
            </div>
          </Link>
        ))
      )}
    </section>
  );
}

function AccountFollowing({
  navPillars,
  followedSlugs,
}: {
  navPillars: ReadonlyArray<NavPillar>;
  followedSlugs: ReadonlyArray<string>;
}) {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const [following, setFollowing] = useState<Set<string>>(() => new Set(followedSlugs));
  const [, startTransition] = useTransition();

  const toggle = (slug: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    startTransition(async () => {
      await toggleFollow(slug);
      router.refresh();
    });
  };

  return (
    <section>
      <h2
        className="serif"
        style={{
          margin: "0 0 8px",
          fontSize: 24,
          fontWeight: 650,
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
        {navPillars.map((p) => {
          const on = following.has(p.slug);
          return (
            <div
              key={p.slug}
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
                <span style={{ fontSize: 14, fontWeight: 600 }}>{p.title[lang]}</span>
              </div>
              <Button
                variant={on ? "primary" : "outline"}
                size="sm"
                onClick={() => toggle(p.slug)}
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

/**
 * Real newsletter list + real per-newsletter subscribed state (Stage D).
 * Mirrors `AccountFollowing`'s exact optimistic-toggle shape: flip local
 * state immediately, fire `setNewsletter`, reconcile with `router.refresh()`.
 */
function AccountNewsletters({
  newsletters,
  subscribedIds,
}: {
  newsletters: ReadonlyArray<Newsletter>;
  subscribedIds: ReadonlyArray<string>;
}) {
  const t = useT();
  const router = useRouter();
  const [subs, setSubs] = useState<Set<string>>(() => new Set(subscribedIds));
  const [, startTransition] = useTransition();

  const toggle = (slug: string) => {
    const next = !subs.has(slug);
    setSubs((prev) => {
      const n = new Set(prev);
      if (next) n.add(slug);
      else n.delete(slug);
      return n;
    });
    startTransition(async () => {
      await setNewsletter(slug, next);
      router.refresh();
    });
  };

  return (
    <section>
      <h2
        className="serif"
        style={{
          margin: "0 0 18px",
          fontSize: 24,
          fontWeight: 650,
          letterSpacing: "-0.015em",
        }}
      >
        {t("Your newsletters", "Bản tin của bạn", "Newsletter Anda")}
      </h2>
      {newsletters.length === 0 ? (
        <EmptyState
          text={t(
            "No newsletters available yet.",
            "Chưa có bản tin nào.",
            "Belum ada newsletter tersedia."
          )}
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {newsletters.map((n) => {
            const on = subs.has(n.slug);
            return (
              <div
                key={n.slug}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 14,
                  alignItems: "center",
                  padding: "16px 18px",
                  background: "var(--surface)",
                  border: "1px solid var(--hair)",
                  borderRadius: 6,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{n.name}</div>
                  <div className="text-mute" style={{ fontSize: 12, marginTop: 3 }}>
                    <span className="mono">{n.cadence}</span> · {n.description}
                  </div>
                </div>
                <Button variant={on ? "accent" : "outline"} size="sm" onClick={() => toggle(n.slug)}>
                  {on ? t("Subscribed", "Đã đăng ký", "Berlangganan") : t("Subscribe", "Đăng ký", "Langganan")}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
