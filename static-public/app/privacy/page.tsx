import PolicyEssayPage from "@/components/marketing/PolicyEssayPage";
import { policyPageContent } from "@/lib/policy-pages";

export default function StaticPublicPrivacyPage() {
  return <PolicyEssayPage content={policyPageContent.privacy} />;
}
