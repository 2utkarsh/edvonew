import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function ContactPage() {
  return <MarketingPage config={getPublicPageConfig("contact")} />;
}
