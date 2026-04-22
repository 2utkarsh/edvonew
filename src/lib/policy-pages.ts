export interface PolicyMetaItem {
  label: string;
  value: string;
}

export interface PolicySection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface PolicyPageContent {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  meta: PolicyMetaItem[];
  sections: PolicySection[];
  closing: string;
}

export const policyPageContent: Record<string, PolicyPageContent> = {
  privacy: {
    slug: "privacy",
    eyebrow: "Privacy Policy",
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains how EDVO, operated by G&A Itech Innovation Foundation, collects, uses, stores, and protects information when people visit the website, create accounts, enroll in programs, attend live sessions, purchase digital learning services, or contact support. Because EDVO delivers digital education services such as bootcamps, self-paced courses, workshops, events, and related learner support, some personal and billing information is required to provide access, process payments, and maintain the platform responsibly.",
    meta: [
      { label: "Legal Entity", value: "G&A Itech Innovation Foundation" },
      { label: "Last Updated", value: "22 April 2026" },
      {
        label: "Applies To",
        value: "Visitors, learners, applicants, partners, and support requests",
      },
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "Information We Collect",
        paragraphs: [
          "We may collect information that users provide directly, including name, email address, phone number, city, academic or professional profile details, billing details, and any information submitted through registration forms, applications, contact forms, support requests, or event signups. When a learner makes a payment, the information required for transaction processing and payment reconciliation may also be collected through our payment flow or authorized payment partners.",
          "We may also collect limited technical and usage information such as IP address, browser type, device information, referral source, session activity, course progress, assessment activity, attendance information, and page interactions. This information helps us operate the website, secure accounts, troubleshoot issues, improve learning workflows, and understand how our services are being used.",
        ],
      },
      {
        id: "how-we-use-information",
        title: "How We Use Information",
        paragraphs: [
          "Information collected through the website is used to create and manage accounts, verify registrations, process enrollments, provide course access, deliver live and recorded learning experiences, communicate important updates, issue invoices or payment confirmations, respond to support requests, and maintain the overall quality of the learner experience. We may also use information to personalize content, improve program operations, and prevent fraud or misuse.",
          "Where relevant, information may also be used to evaluate applications, coordinate community participation, manage events and workshops, support hiring-related collaborations, and send transactional or service-related communication. We do not collect personal information for unrelated purposes, and we do not sell personal data as a standalone commercial product.",
        ],
      },
      {
        id: "payments-and-third-parties",
        title: "Payments and Third-Party Services",
        paragraphs: [
          "Payments on the EDVO website are used for digital education services and related learner offerings, including cohort enrollments, courses, workshops, event registrations, and similar platform services delivered digitally. To complete these transactions, we may rely on authorized payment gateway partners, communication tools, analytics providers, cloud hosting services, and other service providers that support normal website operations.",
          "Such third parties may process limited information strictly for operational purposes such as payment confirmation, fraud checks, hosting, delivery of live classes, email notifications, and customer support. Users should understand that these third-party services may have their own policies and operational safeguards, and we work with them only to the extent reasonably required to deliver the service.",
        ],
      },
      {
        id: "sharing-and-disclosure",
        title: "Sharing and Disclosure",
        paragraphs: [
          "Personal information is shared only on a need-to-know basis for business operations, platform delivery, support resolution, lawful compliance, or protection of rights and security. For example, information may be shared with payment partners for transaction processing, with technical vendors for hosting and communications, or with professional advisers and authorities where required by law or in response to a valid legal process.",
          "We do not publish private personal information openly, and we do not disclose learner data to unrelated outside parties for their independent marketing use. Internal access is expected to remain limited to personnel or authorized partners who require the information to perform specific operational responsibilities.",
        ],
      },
      {
        id: "retention-and-security",
        title: "Data Retention and Security",
        paragraphs: [
          "We retain information for as long as it is reasonably needed to provide services, maintain records, resolve disputes, comply with legal or financial obligations, and support legitimate business operations. Some information may remain in backups, logs, invoices, audit records, or archived administrative systems for an appropriate period even after active use ends.",
          "We use reasonable administrative and technical measures to protect data against unauthorized access, loss, misuse, or alteration. However, no internet-based system can guarantee absolute security, so users should also protect their own account credentials, avoid sharing login access, and notify us promptly if they suspect unauthorized activity.",
        ],
      },
      {
        id: "user-rights-and-choices",
        title: "User Rights and Choices",
        paragraphs: [
          "Users may contact EDVO through the official contact channel to request reasonable corrections to inaccurate account information, seek clarification about data usage, or raise concerns about communications and account privacy. Where technically and legally feasible, we may update or correct records after verifying the request.",
          "Some communications are essential for service delivery, such as payment confirmations, access emails, support messages, class notices, and important account alerts. Opting out of such essential messages may affect the ability to use the platform properly, though users may still request reduced promotional communication where applicable.",
        ],
      },
      {
        id: "policy-updates",
        title: "Updates to This Policy",
        paragraphs: [
          "This Privacy Policy may be revised from time to time when the platform, services, legal requirements, or operational practices change. Updated versions become effective when published on the website unless a different effective date is stated.",
          "Continued use of the website after an update means the revised policy will apply to future use of the platform. Users who do not agree with a material change should discontinue use and contact the support team for clarification.",
        ],
      },
    ],
    closing:
      "For privacy-related questions, corrections, or clarification requests, please use the Contact Us page on the website and mention the relevant account or transaction details.",
  },
  terms: {
    slug: "terms",
    eyebrow: "Terms and Conditions",
    title: "Terms and Conditions",
    intro:
      "These Terms and Conditions govern the use of EDVO and the digital education services made available through the website. EDVO, operated by G&A Itech Innovation Foundation, offers services such as live bootcamps, self-paced courses, workshops, events, learner resources, and related support. By accessing the website, creating an account, enrolling in a program, or making a payment, the user agrees to follow these terms and any program-specific rules communicated on the relevant page.",
    meta: [
      { label: "Legal Entity", value: "G&A Itech Innovation Foundation" },
      { label: "Last Updated", value: "22 April 2026" },
      {
        label: "Service Scope",
        value: "Digital learning services, events, and related support",
      },
    ],
    sections: [
      {
        id: "eligibility-and-accounts",
        title: "Eligibility and Accounts",
        paragraphs: [
          "Users are expected to provide accurate and complete information while creating an account, submitting an application, or purchasing a service. The user is responsible for maintaining the confidentiality of account credentials and for all activity that takes place under the account unless EDVO is notified promptly of unauthorized access.",
          "If any information provided is false, misleading, outdated, or incomplete, EDVO may restrict access, seek clarification, or suspend the account until the issue is resolved. Access rights granted through the website are personal and are not meant to be shared, transferred, sublicensed, or used on behalf of another person without explicit authorization.",
        ],
      },
      {
        id: "enrollments-pricing-and-payments",
        title: "Enrollments, Pricing, and Payments",
        paragraphs: [
          "Course fees, event charges, and other paid offerings are displayed on the website or communicated through official EDVO channels. A seat, batch slot, or paid access is treated as confirmed only after successful receipt of payment and acceptance of the registration under the applicable program terms.",
          "EDVO may change pricing, offerings, schedules, faculty allocations, format details, or inclusion lists at reasonable intervals as the platform evolves. Such changes do not automatically apply retrospectively to a completed order unless specifically communicated. Users are responsible for reviewing the program details carefully before completing a purchase.",
        ],
      },
      {
        id: "access-and-digital-delivery",
        title: "Access and Digital Delivery",
        paragraphs: [
          "Most EDVO services are delivered digitally through dashboards, email communication, community channels, recorded content libraries, live class links, documents, downloadable resources, or other online systems. Delivery may begin immediately after payment or according to the schedule of the selected cohort, workshop, or event.",
          "Because services are digital in nature, timely access depends on the user providing correct registration details, checking official communication channels, and maintaining reasonable internet, device, and browser compatibility. EDVO will make reasonable efforts to provide access, but the user remains responsible for basic technical readiness on their end.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable Use",
        paragraphs: [
          "Users must use the website and community spaces lawfully, respectfully, and in a manner consistent with the intended educational purpose of the platform. Misuse includes unauthorized account sharing, copying or redistributing paid content without permission, attempting to disrupt the website, posting abusive or unlawful material, impersonating others, or using the platform in a way that harms learners, staff, partners, or systems.",
          "EDVO may investigate suspicious behavior and may remove content, limit access, suspend participation, or terminate service where necessary to protect the platform and community. Use of the website should remain professional, accurate, and consistent with applicable law.",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual Property and Content Usage",
        paragraphs: [
          "Unless otherwise stated, the website content, course structure, lesson recordings, assignments, presentations, graphics, branding, copy, documentation, and training materials are the property of EDVO or the relevant rights holder and are made available only for the approved personal or organizational use connected with the enrolled service.",
          "Users may not reproduce, republish, sell, record, distribute, upload, or commercially exploit paid or protected material without written permission. Limited personal note-taking and reasonable personal educational use are allowed, but any broader reuse remains subject to the rights of EDVO and its content partners.",
        ],
      },
      {
        id: "suspension-and-termination",
        title: "Suspension and Termination",
        paragraphs: [
          "EDVO may suspend, restrict, or terminate access if a user violates these terms, engages in payment abuse, behaves in a way that threatens community safety, or uses the service dishonestly or unlawfully. EDVO may also restrict access temporarily for maintenance, investigations, technical issues, or operational reasons.",
          "Termination or suspension does not automatically remove obligations already incurred, including payment obligations, restrictions on content usage, or other provisions that are intended to survive closure of the account or completion of the program.",
        ],
      },
      {
        id: "disclaimer-and-limits",
        title: "Disclaimer and Limits of Liability",
        paragraphs: [
          "EDVO makes reasonable efforts to provide accurate information, structured programs, and timely support, but the platform cannot guarantee a specific academic result, employment outcome, interview conversion, business result, or uninterrupted availability at all times. Learning outcomes depend on many factors, including user effort, participation, prior knowledge, and market conditions.",
          "To the extent permitted by applicable law, EDVO will not be responsible for indirect, incidental, special, or consequential loss arising from ordinary use of the website, delays outside reasonable control, user-side technical failure, or misuse of the platform by third parties. Nothing in these terms is intended to exclude liability where it cannot legally be excluded.",
        ],
      },
      {
        id: "updates-and-contact",
        title: "Changes to Terms and Contact",
        paragraphs: [
          "These Terms and Conditions may be updated when the website, services, or legal requirements change. Revised terms become effective when published on the website unless a later date is specified.",
          "By continuing to use the platform after such updates, the user accepts the revised terms for future use. Questions about these terms should be raised through the official Contact Us page before or during use of the service.",
        ],
      },
    ],
    closing:
      "If a learner or partner needs clarification on access, billing, or usage terms, the quickest path is to contact EDVO through the official website support channel.",
  },
  "refund-cancellation-policy": {
    slug: "refund-cancellation-policy",
    eyebrow: "Refund and Cancellation Policy",
    title: "Refund and Cancellation Policy",
    intro:
      "EDVO mainly provides digital services, including live bootcamps, recorded courses, workshops, event access, learner resources, and related support. These services may involve immediate digital access, reserved batch capacity, or release of protected learning material soon after payment. For that reason, refund and cancellation requests are reviewed carefully and are not treated in the same way as returns for physical products.",
    meta: [
      { label: "Legal Entity", value: "G&A Itech Innovation Foundation" },
      { label: "Last Updated", value: "22 April 2026" },
      {
        label: "Applies To",
        value: "Payments for digital courses, workshops, cohorts, and events",
      },
    ],
    sections: [
      {
        id: "when-refunds-may-be-considered",
        title: "When Refunds May Be Considered",
        paragraphs: [
          "Refund requests may be considered in limited and reasonable situations such as duplicate payment, a payment deducted without successful order creation, cancellation of the program by EDVO, or a material service-delivery issue that remains unresolved after the user gives EDVO a fair opportunity to address it. Requests are reviewed on the facts of the specific case and the stage at which the service has already been delivered.",
          "Where a learner raises a genuine issue before substantial usage begins, EDVO may also consider alternatives such as batch transfer, credit adjustment, rescheduling, or partial commercial resolution instead of a direct refund, depending on the nature of the offering and the operational stage of the enrollment.",
        ],
      },
      {
        id: "non-refundable-situations",
        title: "Situations Generally Not Eligible for Refund",
        paragraphs: [
          "As a general rule, fees are not refundable once meaningful digital delivery has started or once the learner has already received substantial value from the service. This includes cases where dashboard access has been activated, live sessions have been attended, recordings or downloadable material have been shared, assignments or mentorship access have begun, or the cohort seat has already been reserved and operational resources have been allocated.",
          "Refunds are also generally not available for change of mind, lack of time, failure to attend scheduled sessions, dissatisfaction based on personal preference after access has begun, failure to review course details before purchase, or technical limitations on the user side such as poor internet, unsupported device setup, or misuse of login credentials.",
        ],
      },
      {
        id: "cancellation-and-transfer",
        title: "Cancellation, Deferral, and Transfer Requests",
        paragraphs: [
          "Users who are unable to continue after registration should notify EDVO as early as possible through the official support channel. Depending on the program format, batch timing, and usage stage, EDVO may allow a deferral, transfer to a later cohort, or another reasonable adjustment instead of cancellation with refund.",
          "Any such adjustment remains discretionary and may depend on seat availability, faculty planning, content-release status, and whether third-party event or payment costs have already been incurred. Approval of a transfer or deferral does not create a general right to future cash refund unless specifically confirmed in writing.",
        ],
      },
      {
        id: "request-process",
        title: "How to Request Refund or Rectification",
        paragraphs: [
          "A user seeking refund, cancellation review, or billing rectification should contact EDVO through the official Contact Us page or the designated support channel from the registered email address or phone number. The request should include the full name, registered contact details, transaction reference, program name, payment date, and a clear explanation of the issue.",
          "Incomplete requests or requests raised from unverified channels may take longer to process because identity and transaction details must first be confirmed. EDVO may ask for supporting documents, payment screenshots, or additional clarification before taking a final view.",
        ],
      },
      {
        id: "approved-refunds",
        title: "Processing of Approved Refunds",
        paragraphs: [
          "If a refund is approved, the amount will usually be processed back to the original payment source or through another appropriate method permitted by the payment system. Processing timelines depend on banking systems, payment gateways, and settlement cycles, so the actual credit date may vary even after approval has been issued.",
          "Where only a partial refund, transfer credit, or adjustment is approved, the resolution communicated by EDVO will describe the amount or alternative support being offered. Payment gateway charges, taxes, or operational deductions may be handled according to the underlying transaction terms where applicable and lawful.",
        ],
      },
      {
        id: "chargebacks-and-disputes",
        title: "Chargebacks and Disputes",
        paragraphs: [
          "Users are encouraged to contact EDVO first before initiating a payment dispute or chargeback, especially where the issue relates to access, scheduling, duplicate payment, or delivery clarification. Many concerns can be resolved faster through direct review than through an external dispute route.",
          "If a chargeback is initiated after service delivery or without giving EDVO a fair opportunity to review the matter, access to the platform may be restricted while the dispute is examined. EDVO reserves the right to provide the relevant payment and delivery records to the payment partner or financial institution handling the dispute.",
        ],
      },
    ],
    closing:
      "For quick review of any billing issue, cancellation request, or duplicate payment concern, please contact EDVO promptly with the registered transaction details.",
  },
};
