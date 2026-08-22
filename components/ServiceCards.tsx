"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Bot, Cpu, Layers, Code, TabletSmartphone, SpeechIcon } from "lucide-react";

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  index: number;
}

export function ServiceCards({ total_columns = 2 }: { total_columns?: number }) {
  const services = [
    {
      icon: BrainCircuit,
      title: "AI Software Development",
      desc: "Bespoke AI solutions designed to meet your unique business challenges.",
      link: "/service/ai-software-development"
    },
    {
      icon: Cpu,
      title: "Automation solutions",
      desc: "Streamline operations with AI-driven automation tailored to your business needs.",
      link: "/service/automation-solutions"
    },
    {
      icon: Bot,
      title: "Chatbots",
      desc: "Intelligent, AI-powered chatbots that automate support and enhance user engagement.",
      link: "/service/chatbots"
    },
    {
      icon: Code,
      title: "Software Development",
      desc: "Scalable software solutions tailored to streamline and grow your business.",
      link: "/service/software-development"
    },
    {
      icon: Layers,
      title: "Web Development",
      desc: "Modern, responsive websites and web apps built with cutting-edge technologies.",
      link: "/service/web-development"
    },
    {
      icon: TabletSmartphone,
      title: "Mobile App Development",
      desc: "High-performance iOS and Android apps with seamless user experiences.",
      link: "/service/mobile-app-development"
    },
    {
      icon: SpeechIcon,
      title: "Consulting Services",
      desc: "Expert guidance to help you navigate the digital landscape and make informed decisions.",
      link: "/service/consulting-services"
    },
    {
      icon: SpeechIcon,
      title: "Student Guidance",
      desc: "Free guidance for students to select the right career path in technology.",
      link: "/service/student-guidance"
    }
  ];

  return (
    <div className={`grid gap-8 md:grid-cols-${total_columns}`}>
      {services.map((service, i) => (
        <motion.a
          href={service.link}
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <service.icon className="h-10 w-10 text-orange-500 dark:text-orange-400 mb-6" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{service.desc}</p>
        </motion.a>
      ))}
    </div>
  );
}
