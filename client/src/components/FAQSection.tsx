import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "How do I join the Game Development Group?",
      answer: "You can join by attending our weekly meetings every Thursday at 6 PM in the Computer Science building, or by filling out our online application form."
    },
    {
      question: "Do I need programming experience to join?",
      answer: "Not at all! We welcome members of all skill levels. We provide workshops and mentorship to help you learn game development from scratch."
    },
    {
      question: "What game engines do you work with?",
      answer: "We primarily use Unity and Unreal Engine, but we also explore other engines like Godot and custom engines depending on the project requirements."
    },
    {
      question: "How often do you hold events?",
      answer: "We host events regularly including weekly meetings, monthly workshops, quarterly game jams, and special guest speaker sessions throughout the semester."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20" id="about">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="gaming-card rounded-xl overflow-hidden">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-[var(--dark-secondary)] transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                <ChevronDown 
                  className={`text-[var(--accent-blue)] transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="p-6 pt-0 text-slate-400">
                  <p>{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
