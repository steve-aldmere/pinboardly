export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Payment successful</h1>
      {sessionId && (
        <p>
          <strong>Session ID:</strong> {sessionId}
        </p>
      )}
      <p>
        <a href="/" style={{ color: "#0066cc", textDecoration: "underline" }}>
          Return to home
        </a>
      </p>
    </div>
  );
}

