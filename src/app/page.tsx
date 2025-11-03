export default function HomePage() {
  return (
    <main style={{ padding: "60px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
        Welcome to Intime
      </h1>
      <p style={{ fontSize: 18, color: "#555", marginBottom: 32 }}>
        Your unified time intelligence hub — manage, track, and visualize events in one place.
      </p>
      <a
        href="/events"
        style={{
          display: "inline-block",
          padding: "12px 20px",
          borderRadius: 8,
          background: "black",
          color: "white",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        View Events →
      </a>
    </main>
  );
}