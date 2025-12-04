import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "#020617",
        color: "white",
      }}
    >
      <div style={{ maxWidth: 640, textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Pinboardly
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            marginBottom: "1.5rem",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          A simple way to create clean, shareable noticeboard pages for your
          lodge, Scout group, or club.
        </p>

        <p style={{ marginBottom: "2rem", color: "rgba(255,255,255,0.7)" }}>
          We&apos;re still building the full product. For now, you can use the
          internal notes tool while we develop Pinboardly.
        </p>

        <Link
          href="/notes"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            borderRadius: 999,
            backgroundColor: "white",
            color: "#020617",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Open Notes Playground
        </Link>
      </div>
    </main>
  );
}
