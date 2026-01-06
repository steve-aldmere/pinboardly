export default function BillingCancelPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Checkout cancelled</h1>
      <p>
        <a
          href="/billing"
          style={{ color: "#0066cc", textDecoration: "underline", marginRight: "20px" }}
        >
          Return to billing
        </a>
        <a href="/" style={{ color: "#0066cc", textDecoration: "underline" }}>
          Return to home
        </a>
      </p>
    </div>
  );
}



