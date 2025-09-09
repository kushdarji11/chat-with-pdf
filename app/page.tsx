import Image from "next/image";
import {
  Brain,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    title: "AI Analysis",
    description:
      "Get deep insights into your video content with our advanced AI analysis. Understand viewer engagement and content quality.",
    icon: Brain,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Smart Transcription",
    description:
      "Get accurate transcriptions of your videos. Perfect for creating subtitles, blog posts, or repurposing content.",
    icon: MessageSquare,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Thumbnail Generation",
    description:
      "Generate eye-catching thumbnails using AI. Boost your click-through rates with compelling visuals.",
    icon: ImageIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Title Generation",
    description:
      "Create attention-grabbing, SEO-optimized titles for your videos using AI. Maximize views with titles that resonate with your audience.",
    icon: MessageSquare,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    title: "Shot Script",
    description:
      "Get detailed, step-by-step instructions to recreate viral videos. Learn shooting techniques, angles, and editing tips from successful content.",
    icon: Video,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Discuss with Your AI Agent",
    description:
      "Engage in deep conversations about your content strategy, brainstorm ideas, and unlock new creative possibilities with your AI agent companion.",
    icon: Sparkles,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

export default function Home() {
  return (
      <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
        <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
          <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">

              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Your Interactive Document Companion
              </h2>

              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Transform Your PDFs into Interactive Conversations
              </p>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                Introducing {""}
                <span className="font-bold text-indigo-600">Chat with PDF.</span>
                <br/>
                <br/> Upload your document, and our chatbot will answer questions, summarize content, and answer all your Qs. Ideal for everyone,
                <span className="text-indigo-600">
                  Chat with PDF
                </span> {""}
                turns static documents into {""}
                <span className="font-bold">dynamic conversations</span>,
                enhancing productivity 10x fold effortlessly.
              </p>

              <Button asChild className="mt-10">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>

            <div className="relative overflow-hidden pt-16">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <Image 
                alt="App screenshot"
                src="https://i.imgur.com/4NcXllU.jpeg"
                width={2432}
                height={1442}
                className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
                />
                <div aria-hidden="true" className="relative">
                  <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]"></div>
                </div>
              </div>  
            </div>  
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24">
            <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6
            gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2
            lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {features.map((feature)=>(
                <div key={feature.title} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <feature.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"/>
                  </dt>
                  <dd>{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </main>
  );
}
