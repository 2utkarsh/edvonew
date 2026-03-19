import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function EventsPage() {
  return <MarketingPage config={getPublicPageConfig("events")} />;
}
