import { useMutation } from "@tanstack/react-query";
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
