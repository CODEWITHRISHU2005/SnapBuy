"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, AnimatePresence } from "framer-motion"

interface HelpTopic {
  id: string
  question: string
  answer: string
}

const helpTopics: HelpTopic[] = [
  {
    id: "order",
    question: "How to place an order?",
    answer:
      "Browse our products, add items to your cart, proceed to checkout, fill in your shipping and payment details, and click 'Place Order'.",
  },
  {
    id: "return",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy. If you're not satisfied with your purchase, you can return it within 30 days for a full refund.",
  },
  {
    id: "cod",
    question: "Do you offer COD?",
    answer:
      "Yes, we offer Cash on Delivery (COD) for orders within select locations. You can select COD as your payment method during checkout.",
  },
  {
    id: "shipping",
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3-5 business days. Express shipping (available at an additional cost) takes 1-2 business days.",
  },
  {
    id: "discount",
    question: "Do you offer discounts?",
    answer:
      "We regularly offer seasonal discounts and promotions. Sign up for our newsletter to stay updated on our latest offers.",
  },
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const chatbotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={chatbotRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-card rounded-lg shadow-lg border mb-4 w-80 max-h-[500px] flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">Help Center</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <p className="text-sm text-muted-foreground mb-4">How can we help you today? Select a topic below:</p>

              <Accordion type="single" collapsible className="w-full">
                {helpTopics.map((topic) => (
                  <AccordionItem key={topic.id} value={topic.id}>
                    <AccordionTrigger className="text-sm">{topic.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{topic.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="p-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                Need more help? Contact us at support@snapbuy.com
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button onClick={() => setIsOpen(!isOpen)} className="h-12 w-12 rounded-full shadow-lg">
        {isOpen ? <ChevronDown className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
