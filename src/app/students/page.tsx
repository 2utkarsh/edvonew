import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function StudentsPage() {
  return <MarketingPage config={getPublicPageConfig("students")} />;
}
