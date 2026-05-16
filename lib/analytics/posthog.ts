import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "https://app.posthog.com",
});

export const track = (event: string, props?: any) => {
  posthog.capture(event, props);
};