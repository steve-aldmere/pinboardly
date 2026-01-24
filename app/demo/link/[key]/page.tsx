import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type DemoLinkPage = {
  title: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
};

const PAGES: Record<string, DemoLinkPage> = {
  contact: {
    title: "Contact page",
    summary:
      "An example of linking to a contact or enquiry page. Many groups use this for questions, support requests, or general enquiries so messages don’t get lost in chat threads.",
    imageSrc: "/demo/contact.png",
    imageAlt: "Example contact page",
  },

  form: {
    title: "Form or survey",
    summary:
      "A common use case: surveys, sign-ups, bookings, or feedback forms. Pinning the link means everyone knows where to find it, even weeks later.",
    imageSrc: "/demo/form.png",
    imageAlt: "Example form",
  },

  handbook: {
    title: "Handbook or document",
    summary:
      "Ideal for handbooks, policies, constitutions, or guidance documents that people need to refer back to occasionally.",
    imageSrc: "/demo/handbook.png",
    imageAlt: "Example handbook document",
  },

  "sign-in": {
    title: "Sign-in page",
    summary:
      "Many organisations pin the login page for a system they already use, reducing friction and repeated questions about where to sign in.",
    imageSrc: "/demo/sign-in.png",
    imageAlt: "Example sign-in page",
  },

  webpage: {
    title: "Useful website",
    summary:
      "A simple example of linking to a useful external website, such as a parent organisation, booking site, or reference page.",
    imageSrc: "/demo/webpage.png",
    imageAlt: "Example website",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const page = PAGES[key];
  return {
    title: page ? `${page.title} | Pinboardly demo` : "Demo link | Pinboardly",
  };
}

export default async function DemoLinkPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const page = PAGES[key];

  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        {page.title}
      </h1>

      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {page.summary}
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-white p-4">
        <Image
          src={page.imageSrc}
          alt={page.imageAlt}
          width={1400}
          height={900}
          className="h-auto w-full rounded-xl border border-border"
          priority
        />
      </div>

      <div className="mt-8">
        <Link
          href="/demo-board"
          className="inline-flex items-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white"
        >
          Return to demo notice board
        </Link>
      </div>
    </main>
  );
}
