import { apiRequest, API_BASE_URL } from "./api-client";
import { tokenStore } from "./token-store";

export type DocumentType =
  | "summary_of_benefits"
  | "annual_notice_of_changes"
  | "evidence_of_coverage"
  | string;

export type DocStatus = "draft" | "in_review" | "approved" | "exported";

export interface ManagedDocumentSummary {
  id: string;
  title: string;
  client_code: string;
  document_type: DocumentType;
  status: DocStatus;
  page_count: number;
  section_count: number;
  latest_qa_score: number | null;
  updated_at: string;
}

export interface RepeaterBlock {
  id: string;
  label: string;
  sort_order: number;
  html: string;
  data: Record<string, string>;
}

export interface AuthoringSection {
  id: string;
  section_key: string;
  title: string;
  sort_order: number;
  html: string;
  locked: boolean;
  style_profile: Record<string, string>;
  repeaters: RepeaterBlock[];
}

export interface AuthoringPage {
  id: string;
  number: number;
  title: string;
  sort_order: number;
  page_style: Record<string, string>;
  sections: AuthoringSection[];
}

export interface ManagedDocument {
  id: string;
  owner_id: string;
  title: string;
  client_code: string;
  document_type: DocumentType;
  status: DocStatus;
  metadata: Record<string, string>;
  stylesheet: string;
  pages: AuthoringPage[];
  latest_qa_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  code: string;
  name: string;
  description: string;
}

export interface DocumentTypeProfile {
  code: DocumentType;
  name: string;
  description: string;
  spec_profile: string;
}

export interface TemplateSection {
  id: string;
  number: string;
  title: string;
  level: number;
  default_html: string;
}

export interface Template {
  id: string;
  name: string;
  document_type: DocumentType;
  cms_year: number;
  source_files: string[];
  sections: TemplateSection[];
}

export const docsApi = {
  listTemplates: () => apiRequest<Template[]>("/templates"),
  getTemplate: (id: string) => apiRequest<Template>(`/templates/${id}`),

  listClients: () => apiRequest<ClientProfile[]>("/catalog/clients"),
  listDocumentTypes: () =>
    apiRequest<DocumentTypeProfile[]>("/catalog/document-types"),

  list: () => apiRequest<ManagedDocumentSummary[]>("/managed-documents"),
  get: (id: string) => apiRequest<ManagedDocument>(`/managed-documents/${id}`),
  create: (payload: {
    title: string;
    client_code?: string;
    document_type?: DocumentType;
    metadata?: Record<string, string>;
  }) =>
    apiRequest<ManagedDocument>("/managed-documents", {
      method: "POST",
      body: payload,
    }),
  update: (
    id: string,
    payload: Partial<{
      title: string;
      status: DocStatus;
      metadata: Record<string, string>;
      stylesheet: string;
      pages: AuthoringPage[];
    }>,
  ) =>
    apiRequest<ManagedDocument>(`/managed-documents/${id}`, {
      method: "PUT",
      body: payload,
    }),
  remove: (id: string) =>
    apiRequest<{ deleted: boolean }>(`/managed-documents/${id}`, {
      method: "DELETE",
    }),

  updateSection: (documentId: string, sectionId: string, html: string) =>
    apiRequest<ManagedDocument>(
      `/managed-documents/${documentId}/sections/${sectionId}`,
      { method: "PUT", body: { html } },
    ),

  renderHtml: (id: string, inline = false) =>
    apiRequest<string>(
      `/managed-documents/${id}/html${inline ? "?inline=true" : ""}`,
      { asText: true },
    ),

  styleQa: (id: string) =>
    apiRequest(`/managed-documents/${id}/style-qa`, { method: "POST" }),
  aiStyleFixes: (id: string) =>
    apiRequest(`/managed-documents/${id}/ai-style-fixes`, { method: "POST" }),
};

/** Build the absolute URL for an export download (with auth header path use renderHtml instead). */
export function exportUrl(filename: string) {
  return `${API_BASE_URL}/exports/${encodeURIComponent(filename)}`;
}

export { API_BASE_URL };
export { tokenStore };
