"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { ChevronDown, ChevronUp, BarChart2, X } from "lucide-react"
import { SBUWiseAuditData, useSBUWiseSummaryMutation } from "@/api"
import MarkdownDisplay from '@/components/ui/markdown-display'

interface SBUWiseAuditsProps {
  data: SBUWiseAuditData[]
  loading: boolean
}

export default function SBUWiseAudits({
  data,
  loading,
}: SBUWiseAuditsProps) {
  const [showAll, setShowAll] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryContent, setSummaryContent] = useState("")
  const [summaryStatus, setSummaryStatus] = useState<"loading" | "success" | "error">("loading")

  const { mutate: generateSummary, isPending: isGenerating } = useSBUWiseSummaryMutation()

  // Format and sort the data for display
  const sortedData = [...data].sort((a, b) => b.totalAudits - a.totalAudits)
  const displayData = showAll ? sortedData : sortedData.slice(0, 5)

  const formattedData = displayData.map((item) => ({
    ...item,
    sbu: item.sbu.includes("(")
      ? `${item.sbu.split("(")[0].trim()} (${item.sbu.split("(")[1].replace(")", "")})`
      : item.sbu,
    displayName: item.sbu.includes("(")
      ? `${item.sbu.split("(")[0].trim()} (${item.totalAudits})`
      : `${item.sbu} (${item.totalAudits})`,
  }))

  const handleGenerateSummary = () => {
    // Show the modal immediately with loading state
    setSummaryStatus("loading")
    setShowSummary(true)

    // Then trigger the API call
    generateSummary(undefined, {
      onSuccess: (data) => {
        setSummaryContent(data.data)
        setSummaryStatus("success")
      },
      onError: (error) => {
        console.error("Failed to generate summary:", error)
        setSummaryContent("Failed to generate summary. Please try again later.")
        setSummaryStatus("error")
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded text-xs">
          <p className="font-semibold">{`${payload[0].payload.sbu}`}</p>
          <p className="text-[#d13b3b]">{`Trouble: ${payload[0].value}`}</p>
          {payload[0].payload.needsAttention > 0 && (
            <p className="text-[#ff9800]">{`Needs Attention: ${payload[0].payload.needsAttention}`}</p>
          )}
          {payload[0].payload.onPlan > 0 && <p className="text-[#2196f3]">{`On Plan: ${payload[0].payload.onPlan}`}</p>}
          {payload[0].payload.completed > 0 && (
            <p className="text-[#4caf50]">{`Completed: ${payload[0].payload.completed}`}</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col items-center w-full mt-8">
      <div className="w-full bg-[#355c7d] text-white py-4 text-start text-2xl font-bold uppercase tracking-wider relative px-2">
        SBU-WISE

        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded flex items-center transition-colors"
          onClick={handleGenerateSummary}
          disabled={isGenerating || loading}
        >
          <BarChart2 size={14} className="mr-1" />
          <span>{isGenerating ? "Generating..." : "Generate Summary"}</span>
        </button>
      </div>

      <div className="w-full max-w-5xl p-6 bg-[#e6eef5] rounded-3xl shadow-lg mt-4 relative">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">
                  {showAll ? "All SBUs" : "Top 5 SBUs"}
                </h3>
                {data.length > 5 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <span>{showAll ? "Show Top 5" : "Show All"}</span>
                    {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={formattedData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis
                    type="number"
                    label={{
                      value: `NUMBER OF AUDITS (Total: ${data.length})`,
                      position: "bottom",
                      style: { textAnchor: "middle", fill: "#666", fontWeight: "bold" },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="displayName"
                    tick={{ fontSize: 12, fontWeight: "bold" }}
                    label={{
                      value: "SBU",
                      angle: -90,
                      position: "left",
                      style: { textAnchor: "middle", fill: "#666", fontWeight: "bold" },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="trouble"
                    stackId="a"
                    name={`Trouble (${formattedData.reduce((sum, item) => sum + item.trouble, 0)})`}
                    fill="#d13b3b"
                  >
                    {formattedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#d13b3b" />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="needsAttention"
                    stackId="a"
                    name={`Needs Attention (${formattedData.reduce((sum, item) => sum + item.needsAttention, 0)})`}
                    fill="#ff9800"
                  />
                  <Bar
                    dataKey="onPlan"
                    stackId="a"
                    name={`On Plan (${formattedData.reduce((sum, item) => sum + item.onPlan, 0)})`}
                    fill="#2196f3"
                  />
                  <Bar
                    dataKey="completed"
                    stackId="a"
                    name={`Completed (${formattedData.reduce((sum, item) => sum + item.completed, 0)})`}
                    fill="#4caf50"
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Summary Dialog */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#355c7d] text-white py-3 px-4 flex justify-between items-center rounded-t-xl">
              <h3 className="font-bold">SBU-wise Summary Analysis</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {summaryStatus === "loading" ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-center text-gray-600">
                    Generating SBU-wise summary...
                    <br />
                    <span className="text-sm text-gray-500">This may take up to a minute. Please wait.</span>
                  </p>
                </div>
              ) : summaryStatus === "error" ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700">
                    {summaryContent || "Failed to generate summary. Please try again later."}
                  </p>
                </div>
              ) : (
                <MarkdownDisplay content={summaryContent} />
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 py-3 px-4 rounded-b-xl border-t flex justify-end">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}