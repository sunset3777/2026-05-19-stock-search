import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import { LandingPage } from "@/features/landing/components/LandingPage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const title = "台股分析搜尋｜TWSE OpenAPI 股票資料查詢";
  const description =
    "查詢台股上市個股行情、估值、月營收與財報三表，整合 TWSE OpenAPI 與 FinMind 資料來源。";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} key="og-title" />
        <meta property="og:description" content={description} key="og-description" />
        <meta property="og:type" content="website" key="og-type" />
        <meta name="twitter:title" content={title} key="twitter-title" />
        <meta name="twitter:description" content={description} key="twitter-description" />
      </Head>
      <div className={`${geistSans.className} ${geistMono.className}`}>
        <LandingPage />
      </div>
    </>
  );
}
