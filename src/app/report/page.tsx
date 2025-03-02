'use client'

import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { FileText, User, List, Download, Calendar, ExternalLink, Plus } from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuditReportGeneratorMutation, useGetAllReportsQuery, Report } from "@/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import MarkdownDisplay from "@/components/ui/markdown-display"
import { format } from 'date-fns'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  pdf?: string
}

// Add preset report options
const presetReports = [
  "Audit status overview",
  "Business unit wise audit report",
  "Location wise audit report",
  "Critical Concerns report",
  "Audit timeline report",
  "Completion status report",
  "Auditor workload report"
]

export default function ReportGenerator() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const [threadId, setThreadId] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(true)
  const [reportsModalOpen, setReportsModalOpen] = useState(false)
  const [reportDescription, setReportDescription] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { mutate: generateReport, isPending } = useAuditReportGeneratorMutation()
  const { data: reportsData, isLoading: isLoadingReports, refetch: refetchReports } = useGetAllReportsQuery()

  // Add new state for preset dialog
  const [presetDialogOpen, setPresetDialogOpen] = useState(false)

  // Initialize threadId on component mount
  useEffect(() => {
    const newThreadId = uuidv4()
    setThreadId(newThreadId)
  }, [])

  // Scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])


  const handleReportDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReportDescription(e.target.value)
  }

  const openReportsModal = () => {
    refetchReports()
    setReportsModalOpen(true)
  }

  const openPromptModal = () => {
    setReportDescription('')
    setModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  const startReportGeneration = () => {
    if (!reportDescription.trim() || !threadId) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: reportDescription,
      role: 'user'
    }
    setMessages(prev => [...prev, userMessage])
    setModalOpen(false)


    try {
      // Call the API with threadId
      generateReport(
        {
          question: reportDescription,
          threadId: threadId
        },
        {
          onSuccess: (response) => {
            // Add assistant message
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: response.data.content,
              pdf: response.data.pdf,
              role: 'assistant'
            }
            setMessages(prev => [...prev, assistantMessage])

          },
          onError: (error) => {
            console.error('Error:', error)
          }
        }
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Keeping this function for future use but not using it currently
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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


    try {
      // Call the API with threadId
      generateReport(
        {
          question: input,
          threadId: threadId
        },
        {
          onSuccess: (response) => {
            // Add assistant message
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: response.data.content,
              pdf: response.data.pdf,
              role: 'assistant'
            }
            setMessages(prev => [...prev, assistantMessage])

          },
          onError: (error) => {
            console.error('Error:', error)
          }
        }
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handlePresetSelect = (preset: string) => {
    setReportDescription(preset)
    setPresetDialogOpen(false)
    setModalOpen(true)
  }

  // Add component for displaying preset reports
  const PresetReportsList = () => (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Select a report type</h2>
      <div className="bg-card rounded-lg shadow-sm p-4 border">
        <div className="grid gap-2">
          {presetReports.map((report, index) => (
            <button
              key={index}
              className="text-left p-2 hover:bg-accent rounded-md transition-colors text-sm bg-gray-50"
              onClick={() => handlePresetSelect(report)}
            >
              {report}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Audit Report</DialogTitle>
            <DialogDescription>
              Please describe what type of report you want to generate.
              Note: Report generation may take 2-3 minutes to complete.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="report-description">Report Description</Label>
              <Textarea
                id="report-description"
                value={reportDescription}
                onChange={handleReportDescriptionChange}
                placeholder="E.g., Generate a security audit report for a web application with user authentication and payment processing..."
                className="min-h-[120px]"
              />
              
              {/* Add preset buttons */}
              <div className="mt-3">
                <Label className="mb-2 block">Quick Select:</Label>
                <div className="flex flex-wrap gap-2">
                  {presetReports.slice(0, 3).map((preset, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReportDescription(preset)}
                      className="text-xs"
                    >
                      {preset}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPresetDialogOpen(true)}
                    className="text-xs"
                  >
                    More options...
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={startReportGeneration} 
              disabled={!reportDescription.trim()}
              className="bg-[#E02727] hover:bg-[#C42728] text-white"
            >
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add new dialog for preset reports */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Select Report Type</DialogTitle>
            <DialogDescription>
              Choose from our preset report templates or create a custom report.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <PresetReportsList />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={reportsModalOpen} onOpenChange={setReportsModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>All Generated Reports</DialogTitle>
            <DialogDescription>
              View and download previously generated audit reports.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingReports ? (
              <div className="flex justify-center py-8">
                <ThreeDots
                  visible={true}
                  height="40"
                  width="80"
                  color="black"
                  radius="9"
                  ariaLabel="loading-reports"
                />
              </div>
            ) : reportsData?.data && reportsData.data.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {reportsData.data.map((report: Report, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-purple-500" />
                        <div>
                          <p className="font-medium">{report.filename}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </a>
                        <a
                          href={report.url}
                          download
                          className="inline-flex items-center"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reports found. Generate a report to see it here.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-start justify-center p-4">
        <Card className="w-full max-w-full h-screen border-[#F5A846]/20">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#F5A846]/20 pb-4">
            <CardTitle className="text-2xl font-bold text-[#C42728]">Audit Report Generator</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPresetDialogOpen(true)}
                className="flex items-center border-[#F5A846] text-[#C42728] hover:bg-[#FBE6B8] hover:text-[#C42728]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
              <Button
                variant="outline"
                onClick={openReportsModal}
                className="flex items-center border-[#F5A846] text-[#C42728] hover:bg-[#FBE6B8] hover:text-[#C42728]"
              >
                <List className="h-4 w-4 mr-2" />
                View All Reports
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {messages.length > 0 ? (
              <ScrollArea className="h-[80vh] pr-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    {message.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-[#C42728] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[100%] p-3 rounded-lg ${message.role === 'user'
                        ? 'bg-[#E02727] text-white'
                        : 'bg-[#FBE6B8] text-gray-800'
                        }`}
                    >
                      {message.role === 'user' ? (
                        <>
                        <p>{message.content}</p>
                        </>
                      ) : (
                        <div>
                          <div className="flex space-x-2 mb-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs border-[#F5A846] text-[#C42728] hover:bg-[#FBE6B8]"
                              onClick={() => window.open(message.pdf, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Report
                            </Button>
                            <a href={message.pdf} download>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs border-[#F5A846] text-[#C42728] hover:bg-[#FBE6B8]"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download Report
                              </Button>
                            </a>
                          </div>
                          <div className="mt-2">
                            <MarkdownDisplay content={message.content} />
                            
                            {/* Add buttons at the bottom of AI content */}
                            <div className="flex space-x-2 mt-4 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs border-[#F5A846] text-[#C42728] hover:bg-[#FBE6B8]"
                                onClick={() => window.open(message.pdf, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Report
                              </Button>
                              <a href={message.pdf} download>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs border-[#F5A846] text-[#C42728] hover:bg-[#FBE6B8]"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download Report
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-[#F5A846] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isPending && (
                  <div className="flex items-start space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#C42728] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-[#FBE6B8] p-4 rounded-lg">
                      <div className="mb-2">
                        <ThreeDots
                          visible={true}
                          height="10"
                          width="80"
                          color="#C42728"
                          radius="9"
                          ariaLabel="three-dots-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                        />
                      </div>
                      <p className="text-sm text-gray-600">Generating your report. This may take 2-3 minutes...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[80vh]">
                <FileText className="h-16 w-16 text-[#F5A846] mb-4" />
                <h3 className="text-xl font-medium text-[#C42728] mb-2">No Reports Generated Yet</h3>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  Select a report type to generate or create a custom report.
                </p>
                <div className="flex flex-col space-y-4 w-full max-w-md">
                  <Button 
                    onClick={() => setPresetDialogOpen(true)} 
                    className="flex items-center justify-center bg-[#E02727] hover:bg-[#C42728] text-white"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Select from Preset Reports
                  </Button>
                  <Button 
                    onClick={openPromptModal} 
                    variant="outline" 
                    className="flex items-center justify-center border-[#F5A846] text-[#C42728] hover:bg-[#FBE6B8] hover:text-[#C42728]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Report
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}