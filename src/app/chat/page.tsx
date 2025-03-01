"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { Send, Bot, User, ListFilter } from "lucide-react"
import { ThreeDots } from "react-loader-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgentChatMutation } from "@/api"
import MarkdownDisplay from "@/components/ui/markdown-display"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Message {
    id: string
    content: string
    role: "user" | "assistant"
}

// Updated preset questions without categories
const presetQuestions = [
    "How many open observations?",
    "How many repeat observations?",
    "Risk wise total observations?",
    "How many observations breached?",
    "How many not due observations?",
    "Location wise breached observations?",
    "Risk type wise breached observations?"
]

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [threadId, setThreadId] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const { mutate: agentChat, isPending } = useAgentChatMutation()

    // Initialize threadId on component mount
    useEffect(() => {
        const newThreadId = uuidv4()
        setThreadId(newThreadId)
    }, [])

    // Scroll to bottom whenever messages change or loading state changes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isPending]) // Updated dependencies to include messages and loading state

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleQuestionSelect = (question: string) => {
        setInput(question)
        setIsDialogOpen(false)
        // Auto-submit the selected question
        submitQuestion(question)
    }

    const submitQuestion = async (question: string) => {
        if (!question.trim() || !threadId) return

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: question,
            role: "user",
        }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            // Call the API with threadId
            agentChat(
                {
                    question: question,
                    threadId: threadId,
                },
                {
                    onSuccess: (response) => {
                        // Add assistant message
                        const assistantMessage: Message = {
                            id: (Date.now() + 1).toString(),
                            content: response.data,
                            role: "assistant",
                        }
                        setMessages((prev) => [...prev, assistantMessage])
                        setIsLoading(false)
                    },
                    onError: (error) => {
                        console.error("Error:", error)
                        setIsLoading(false)
                    },
                },
            )
        } catch (error) {
            console.error("Error:", error)
            setIsLoading(false)
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        submitQuestion(input)
    }

    // Updated component for displaying preset questions without categories
    const PresetQuestionsList = () => (
        <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Select a question to get started</h2>
            <div className="bg-card rounded-lg shadow-sm p-4 border">
                <div className="grid gap-2">
                    {presetQuestions.map((question, index) => (
                        <button
                            key={index}
                            className="text-left p-2 hover:bg-accent rounded-md transition-colors text-sm bg-gray-100"
                            onClick={() => handleQuestionSelect(question)}
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex items-start justify-center p-4">
            <Card className="w-full max-w-full relative">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">AI RAG Chat</CardTitle>
                    {messages.length > 0 && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <ListFilter className="h-4 w-4" />
                                    <span>Questions</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Select a Question</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] pr-4">
                                    <PresetQuestionsList />
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] pr-4" ref={scrollAreaRef}>
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <PresetQuestionsList />
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex items-start space-x-2 mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.role !== "user" && (
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <Bot className="w-5 h-5 text-primary-foreground" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                                        >
                                            {message.role === "user" ? <p>{message.content}</p> : <MarkdownDisplay content={message.content} />}
                                        </div>
                                        {message.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isPending && (
                                    <div className="flex items-start space-x-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-primary-foreground" />
                                        </div>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <ThreeDots
                                                visible={true}
                                                height="10"
                                                width="80"
                                                color="currentColor"
                                                radius="9"
                                                ariaLabel="three-dots-loading"
                                                wrapperStyle={{}}
                                                wrapperClass=""
                                            />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={onSubmit} className="flex w-full space-x-2">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={isPending || isLoading}>
                            {isLoading ? (
                                "Sending..."
                            ) : (
                                <>
                                    Send
                                    <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}

