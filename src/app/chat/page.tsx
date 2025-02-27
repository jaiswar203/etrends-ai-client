'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Send, Bot, User } from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgentChatMutation } from "@/api"
import Markdown from 'react-markdown'

interface Message {
    id: string
    content: string
    role: 'user' | 'assistant'
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [threadId, setThreadId] = useState<string>('')

    const { mutate: agentChat, isPending } = useAgentChatMutation()

    // Initialize threadId on component mount
    useEffect(() => {
        const newThreadId = uuidv4()
        setThreadId(newThreadId)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!input.trim() || !threadId) return

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            role: 'user'
        }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Call the API with threadId
            agentChat(
                {
                    question: input,
                    threadId: threadId
                },
                {
                    onSuccess: (response) => {
                        // Add assistant message
                        const assistantMessage: Message = {
                            id: (Date.now() + 1).toString(),
                            content: response.data,
                            role: 'assistant'
                        }
                        setMessages(prev => [...prev, assistantMessage])
                        setIsLoading(false)
                    },
                    onError: (error) => {
                        console.error('Error:', error)
                        setIsLoading(false)
                    }
                }
            )
        } catch (error) {
            console.error('Error:', error)
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-start justify-center   p-4">
            <Card className="w-full max-w-full ">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">AI RAG Chat</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] pr-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start space-x-2 mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {message.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <Markdown>{message.content}</Markdown>
                                </div>
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isPending && (
                            <div className="flex items-start space-x-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-gray-200 p-4 rounded-lg">
                                    <ThreeDots
                                        visible={true}
                                        height="10"
                                        width="80"
                                        color="black"
                                        radius="9"
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    />
                                </div>
                            </div>
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
                                'Sending...'
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