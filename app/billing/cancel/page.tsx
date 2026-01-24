export default function BillingCancelPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Checkout cancelled</h1>
      <p>
        <a
          href="/billing"
          className="text-primary underline"
          style={{ marginRight: "20px" }}
        >
          Return to billing
        </a>
        <a href="/" className="text-primary underline">
          Return to home
        </a>
      </p>
    </div>
  );
}
