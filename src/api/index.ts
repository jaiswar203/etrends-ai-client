import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Define a generic response interface with unknown as default type
export interface IResponse<T = unknown> {
  message: string;
  data: T;
  success: boolean;
}

interface ChatRequest {
  question: string;
  threadId?: string;
}

const agentChat = async (data: ChatRequest) => {
  const response = await apiClient.post("/agents/chat", data);
  return response.data;
};

export const useAgentChatMutation = () => {
  return useMutation<IResponse<string>, Error, ChatRequest>({
    mutationFn: agentChat,
    mutationKey: ["agentChat"],
  });
};


// Audit Report Generator

interface AuditReportRequest {
  question: string;
  threadId?: string;
}

const auditReportGenerator = async (data: AuditReportRequest) => {
  const response = await apiClient.post("/agents/report", data);
  return response.data;
};

export const useAuditReportGeneratorMutation = () => {
  return useMutation<IResponse<string>, Error, AuditReportRequest>({
    mutationFn: auditReportGenerator,
    mutationKey: ["auditReportGenerator"],
  });
};

// Report List

export interface Report {
  filename: string;
  url: string;
  createdAt: string;
}

const getAllReports = async () => {
  const response = await apiClient.get("/agents/reports");
  return response.data;
};

export const useGetAllReportsQuery = () => {
  return useQuery<IResponse<Report[]>, Error>({
    queryKey: ["reports"],
    queryFn: getAllReports,
  });
};