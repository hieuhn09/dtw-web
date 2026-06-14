"use client";

import { use } from "react";
import Link from "next/link";
import { GridBackdrop } from "@/components/effects";
import { FundingTracker } from "@/components/dashboards/funding-tracker";
import { AILeaderboard } from "@/components/dashboards/ai-leaderboard";
import { useT } from "@/lib/i18n";

type Tab = "funding" | "ai";

function isTab(s: string | undefined): s is Tab {
  return s === "funding" || s === "ai";
}

export default function DashboardsPage({
  params,
}: {
  params: Promise<{ sub?: string[] }>;
}) {
  const { sub } = use(params);
  const tab: Tab = sub && isTab(sub[0]) ? (sub[0] as Tab) : "funding";
  const t = useT();

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <header
        style={{
          borderBottom: "3px solid var(--brand-navy)",
          paddingBottom: 20,
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GridBackdrop
          color="color-mix(in oklab, var(--ink) 6%, transparent)"
          size={32}
          fadeRadius="60%"
        />
        <div style={{ position: "relative" }}>
          <div
            className="kicker"
            style={{
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {t("Data Desk · Preview", "Ban Dữ liệu · Bản xem trước", "Meja Data · Pratinjau")}
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
            {t("Dashboards", "Bảng dữ liệu", "Dasbor")}
          </h1>
          <p
            className="serif text-mute"
            style={{ margin: 0, fontSize: 17, lineHeight: 1.45, maxWidth: 760 }}
          >
            {t(
              "Two trackers in development — Asia tech markets and an AI model leaderboard. The figures shown are sample data while we wire up the feeds. Coming soon.",
              "Hai công cụ theo dõi đang phát triển — thị trường công nghệ châu Á và bảng xếp hạng mô hình AI. Số liệu hiển thị là dữ liệu mẫu trong khi chúng tôi kết nối nguồn. Sắp ra mắt.",
              "Dua pelacak dalam pengembangan — pasar teknologi Asia dan papan peringkat model AI. Angka yang ditampilkan adalah data sampel saat kami menyiapkan feed. Segera hadir."
            )}
          </p>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--hair)",
          marginBottom: 28,
        }}
      >
        {(["funding", "ai"] as const).map((k) => {
          const l =
            k === "funding"
              ? t("Asia Funding Tracker", "Theo dõi gọi vốn châu Á", "Pelacak Pendanaan Asia")
              : t("AI Leaderboard", "Bảng xếp hạng AI", "Papan Peringkat AI");
          return (
          <Link
            key={k}
            href={`/dashboards/${k}`}
            style={{
              padding: "14px 22px",
              borderBottom: tab === k ? "3px solid var(--accent)" : "3px solid transparent",
              marginBottom: -1,
              fontSize: 14,
              fontWeight: tab === k ? 600 : 500,
              color: tab === k ? "var(--ink)" : "var(--muted)",
              textDecoration: "none",
            }}
          >
            {l}
          </Link>
          );
        })}
      </div>

      {tab === "funding" ? <FundingTracker /> : <AILeaderboard />}

      {/* Methodology + sponsor slot */}
      <section
        className="r-split-21"
        style={{
          marginTop: 48,
          display: "grid",
          gap: 24,
        }}
      >
        <div
          style={{
            padding: 24,
            background: "var(--surface)",
            border: "1px solid var(--hair)",
            borderRadius: 8,
          }}
        >
          <div className="kicker" style={{ marginBottom: 8 }}>
            {t("Methodology", "Phương pháp", "Metodologi")}
          </div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--ink-2)",
            }}
          >
            {tab === "funding"
              ? t(
                  "Funding data combines exchange tickers (Asian-listed tech) and announced private rounds (Series A and later) across ASEAN, India, Greater China, Korea, and Japan. We exclude SPAC mergers, secondaries, and bridge rounds < $1M.",
                  "Dữ liệu gọi vốn kết hợp mã niêm yết (công nghệ niêm yết tại châu Á) và các vòng tư nhân được công bố (Series A trở lên) khắp ASEAN, Ấn Độ, Trung Hoa, Hàn Quốc và Nhật Bản. Chúng tôi loại trừ sáp nhập SPAC, giao dịch thứ cấp và vòng cầu nối < 1 triệu USD.",
                  "Data pendanaan menggabungkan ticker bursa (teknologi tercatat di Asia) dan putaran privat yang diumumkan (Seri A dan setelahnya) di ASEAN, India, Tiongkok Raya, Korea, dan Jepang. Kami mengecualikan merger SPAC, sekunder, dan putaran jembatan < $1J."
                )
              : t(
                  "Scores aggregate three independent benchmark sources, normalised to a 0–100 scale per dimension. We disclose the source mix per model. Updated monthly; outliers flagged manually.",
                  "Điểm số tổng hợp từ ba nguồn benchmark độc lập, chuẩn hoá về thang 0–100 cho mỗi chiều. Chúng tôi công bố tỷ lệ nguồn theo từng mô hình. Cập nhật hàng tháng; ngoại lệ được đánh dấu thủ công.",
                  "Skor menggabungkan tiga sumber tolok ukur independen, dinormalisasi ke skala 0–100 per dimensi. Kami mengungkapkan komposisi sumber per model. Diperbarui bulanan; pencilan ditandai manual."
                )}
          </p>
          <p className="mono text-mute-2" style={{ margin: 0, fontSize: 11 }}>
            {t(
              "For informational purposes only · not investment or procurement advice",
              "Chỉ nhằm mục đích thông tin · không phải tư vấn đầu tư hay mua sắm",
              "Hanya untuk tujuan informasi · bukan saran investasi atau pengadaan"
            )}
          </p>
        </div>
        <div
          style={{
            padding: 24,
            background: "var(--sponsored)",
            border: "1px solid #E0B900",
            borderRadius: 8,
          }}
        >
          <div
            className="mono upper"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".14em",
              color: "var(--ink)",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            {t("Sponsor slot · this dashboard", "Vị trí tài trợ · bảng này", "Slot sponsor · dasbor ini")}
          </div>
          <div
            className="serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 6,
            }}
          >
            {t("Brought to you by [Partner Logo]", "Được tài trợ bởi [Logo đối tác]", "Dipersembahkan oleh [Logo Mitra]")}
          </div>
          <p
            style={{
              fontSize: 12,
              color: "color-mix(in oklab, var(--ink) 75%, transparent)",
              margin: 0,
            }}
          >
            {t(
              "Sponsorship does not influence the data or methodology.",
              "Việc tài trợ không ảnh hưởng đến dữ liệu hay phương pháp.",
              "Sponsor tidak memengaruhi data atau metodologi."
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
