"use client";

import { Byline } from "@dtw/ui";
import { fmtDateL, useLang, useT } from "@/lib/i18n";

export interface BylineWiredProps {
  article: {
    /** Author name string. */
    author: string;
    coAuthors?: ReadonlyArray<string>;
    /** ISO date string. */
    published: string;
    readMin: number;
  };
  size?: "sm" | "lg";
}

/**
 * Locale-aware Byline. Accepts the pre-resolved view shape so it works for
 * both the legacy mock data (lib/data.ts) and the Payload-derived ArticleView.
 */
export function BylineWired({ article, size = "sm" }: BylineWiredProps) {
  const t = useT();
  const { lang } = useLang();
  return (
    <Byline
      authorName={article.author}
      coAuthorNames={[...(article.coAuthors ?? [])]}
      dateLabel={fmtDateL(article.published, lang)}
      readMinutes={article.readMin}
      size={size}
      labels={{
        by: t("By", "Bởi", "Oleh"),
        and: t("and", "và", "dan"),
        minRead: t("min read", "phút đọc", "menit baca"),
      }}
    />
  );
}
