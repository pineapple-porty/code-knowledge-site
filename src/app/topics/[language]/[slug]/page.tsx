import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KnowledgeSite from "@/components/KnowledgeSite";
import { topics, type Language } from "@/data/lessons";

type TopicRoute = { language: Language; slug: string };

export function generateStaticParams(): TopicRoute[] {
  return (Object.entries(topics) as [Language, (typeof topics)[Language]][]).flatMap(([language, languageTopics]) =>
    languageTopics.map((topic) => ({ language, slug: topic.id })),
  );
}

export async function generateMetadata({ params }: { params: Promise<TopicRoute> }): Promise<Metadata> {
  const { language, slug } = await params;
  const topic = topics[language]?.find((item) => item.id === slug);
  if (!topic) return { title: "Topic not found — Runtime Notes" };
  return {
    title: `${topic.title} — Runtime Notes`,
    description: topic.description,
  };
}

export default async function TopicPage({ params }: { params: Promise<TopicRoute> }) {
  const { language, slug } = await params;
  if (!topics[language]?.some((topic) => topic.id === slug)) notFound();
  return <KnowledgeSite language={language} slug={slug} />;
}
