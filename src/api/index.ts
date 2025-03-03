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
  return useMutation<IResponse<{
    content:string
    pdf:string
  }>, Error, AuditReportRequest>({
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

// Location Wise Audits

interface LocationWiseAuditParams {
  startYear?: number;
  endYear?: number;
}

export interface LocationWiseAuditData {
  location: string;
  totalAudits: number;
  trouble: number;
  needsAttention: number;
  onPlan: number;
  completed: number;
}

const getLocationWiseAudits = async (params: LocationWiseAuditParams = {}) => {
  const { startYear, endYear } = params;
  const queryParams = new URLSearchParams();
  
  if (startYear) queryParams.append('startYear', startYear.toString());
  if (endYear) queryParams.append('endYear', endYear.toString());
  
  const queryString = queryParams.toString();
  const url = `/location-wise-audits${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const useLocationWiseAuditsQuery = (params: LocationWiseAuditParams = {}) => {
  return useQuery<IResponse<LocationWiseAuditData[]>, Error>({
    queryKey: ['locationWiseAudits', params],
    queryFn: () => getLocationWiseAudits(params),
  });
};

// SBU Wise Audits

interface SBUWiseAuditParams {
  startYear?: number;
  endYear?: number;
}

export interface SBUWiseAuditData {
  sbu: string;
  totalAudits: number;
  trouble: number;
  needsAttention: number;
  onPlan: number;
  completed: number;
}

const getSBUWiseAudits = async (params: SBUWiseAuditParams = {}) => {
  const { startYear, endYear } = params;
  const queryParams = new URLSearchParams();
  
  if (startYear) queryParams.append('startYear', startYear.toString());
  if (endYear) queryParams.append('endYear', endYear.toString());
  
  const queryString = queryParams.toString();
  const url = `/sbu-wise-audits${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const useSBUWiseAuditsQuery = (params: SBUWiseAuditParams = {}) => {
  return useQuery<IResponse<SBUWiseAuditData[]>, Error>({
    queryKey: ['sbuWiseAudits', params],
    queryFn: () => getSBUWiseAudits(params),
  });
};

// Summary Generation APIs

const generateLocationWiseSummary = async () => {
  const response = await apiClient.post("/agents/summary/location");
  return response.data;
};

export const useLocationWiseSummaryMutation = () => {
  return useMutation<IResponse<string>, Error>({
    mutationFn: generateLocationWiseSummary,
    mutationKey: ["locationWiseSummary"],
  });
};

const generateSBUWiseSummary = async () => {
  const response = await apiClient.post("/agents/summary/sbu");
  return response.data;
};

export const useSBUWiseSummaryMutation = () => {
  return useMutation<IResponse<string>, Error>({
    mutationFn: generateSBUWiseSummary,
    mutationKey: ["sbuWiseSummary"],
  });
};
