import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="application-name" content="台股分析搜尋" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#020617" />
        <meta property="og:site_name" content="台股分析搜尋" key="og-site-name" />
        <meta name="twitter:card" content="summary" key="twitter-card" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
