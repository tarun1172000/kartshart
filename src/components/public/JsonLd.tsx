interface ArticleSchemaProps {
  url: string;
  title: string;
  description: string;
  coverImageUrl: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  authorName?: string;
  keywords?: string[];
  articleBody?: string;
}

export function ArticleJsonLd({
  url,
  title,
  description,
  coverImageUrl,
  publishedAt,
  updatedAt,
  authorName = "Kartshart Editorial Desk",
  keywords = [],
  articleBody,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: title,
    description,
    image: [coverImageUrl],
    datePublished: publishedAt ? new Date(publishedAt).toISOString() : undefined,
    dateModified: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Kartshart",
      url: "https://kartshart.com",
      logo: {
        "@type": "ImageObject",
        url: "https://kartshart.com/favicon.ico",
      },
    },
    keywords: keywords.join(", "),
    articleBody: articleBody ? articleBody.slice(0, 1500) : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FaqSchemaProps {
  faq: { question: string; answer: string }[];
}

export function FaqJsonLd({ faq }: FaqSchemaProps) {
  if (!faq || faq.length === 0) return null;

  const validFaqs = faq.filter((f) => f.question && f.answer);
  if (validFaqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbsJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://kartshart.com/#organization",
        name: "Kartshart",
        url: "https://kartshart.com",
        logo: {
          "@type": "ImageObject",
          url: "https://kartshart.com/favicon.ico",
        },
        sameAs: [
          "https://twitter.com/kartshart",
          "https://github.com/kartshart",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://kartshart.com/#website",
        url: "https://kartshart.com",
        name: "Kartshart",
        description:
          "Independent perspectives, deep-dive essays, and modern editorial analyses across technology, business, lifestyle, culture, and India.",
        publisher: {
          "@id": "https://kartshart.com/#organization",
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://kartshart.com/blog?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
