import type { NextPageContext } from "next";
import Link from "next/link";

type ErrorPageProps = {
  statusCode?: number;
};

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main style={{ minHeight: "100vh", padding: "48px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <h1>MSM my store</h1>
      <p>
        {statusCode
          ? `Ocurrio un error ${statusCode}.`
          : "Ocurrio un error inesperado."}
      </p>
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};
