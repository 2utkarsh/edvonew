import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function BlogPage() {
  return <MarketingPage config={getPublicPageConfig("blog")} />;
}
