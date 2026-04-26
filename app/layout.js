import Script from "next/script";

export const metadata = {
  metadataBase: new URL("https://yourdomain.com"),

  title: {
    default: "RoofFlow | Exclusive Roofing Leads & Booked Appointments",
    template: "%s | RoofFlow",
  },

  description:
    "Get exclusive roofing leads near you. RoofFlow delivers high-intent homeowners requesting roofing estimates directly into your pipeline — no cold leads or wasted ad spend.",

  keywords: [
    "roofing leads near me",
    "exclusive roofing leads",
    "roofing appointment service",
    "roofing lead generation",
    "contractor leads",
    "roofing marketing system",
  ],

  openGraph: {
    title: "Exclusive Roofing Leads & Appointments | RoofFlow",
    description:
      "Stop chasing leads. Get pre-qualified homeowners requesting roofing estimates in your area.",
    url: "https://yourdomain.com",
    siteName: "RoofFlow",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "RoofFlow | Roofing Leads & Appointments",
    description:
      "Exclusive roofing leads and booked appointments delivered on demand.",
  },

  alternates: {
    canonical: "https://yourdomain.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),
              dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WQ67Z3XL');
          `}
        </Script>

        {/* ✅ Structured Data (SEO boost) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: "RoofFlow",
              description:
                "Exclusive roofing lead generation and appointment booking service",
              areaServed: "North America",
              provider: {
                "@type": "Organization",
                name: "RoofFlow",
                url: "https://yourdomain.com",
              },
            }),
          }}
        />
      </head>

      <body style={styles.body}>
        {/* ✅ GTM fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WQ67Z3XL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    background: "#0b1220",
    color: "white",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
};
