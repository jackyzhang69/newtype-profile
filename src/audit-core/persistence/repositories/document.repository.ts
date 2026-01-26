import { getSupabaseClient } from "../client"
import type { DocumentRecord, CreateDocumentInput, ExtractionStatus } from "../types"

const TABLE_NAME = "io_documents"

export async function saveDocument(
  sessionId: string,
  input: CreateDocumentInput
): Promise<DocumentRecord> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      session_id: sessionId,
      filename: input.filename,
      original_path: input.original_path ?? null,
      file_type: input.file_type ?? null,
      file_size: input.file_size ?? null,
      storage_path: input.storage_path ?? null,
      extraction_status: input.extraction_status ?? "pending",
      document_type: input.document_type ?? null,
      form_type: input.form_type ?? null,
      xfa_fields: input.xfa_fields ?? null,
      page_count: input.page_count ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save document: ${error.message}`)
  }

  return data as DocumentRecord
}

export async function saveDocuments(
  sessionId: string,
  documents: CreateDocumentInput[]
): Promise<DocumentRecord[]> {
  if (documents.length === 0) return []
  
  const client = getSupabaseClient()
  
  const records = documents.map(input => ({
    session_id: sessionId,
    filename: input.filename,
    original_path: input.original_path ?? null,
    file_type: input.file_type ?? null,
    file_size: input.file_size ?? null,
    storage_path: input.storage_path ?? null,
    extraction_status: input.extraction_status ?? "pending",
    document_type: input.document_type ?? null,
    form_type: input.form_type ?? null,
    xfa_fields: input.xfa_fields ?? null,
    page_count: input.page_count ?? null,
  }))

  const { data, error } = await client
    .from(TABLE_NAME)
    .insert(records)
    .select()

  if (error) {
    throw new Error(`Failed to save documents: ${error.message}`)
  }

  return data as DocumentRecord[]
}

export async function getDocuments(sessionId: string): Promise<DocumentRecord[]> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to get documents: ${error.message}`)
  }

  return data as DocumentRecord[]
}

export async function getDocument(documentId: string): Promise<DocumentRecord | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("id", documentId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get document: ${error.message}`)
  }

  return data as DocumentRecord
}

export async function updateDocumentStatus(
  documentId: string,
  status: ExtractionStatus,
  error?: string
): Promise<DocumentRecord> {
  const client = getSupabaseClient()
  
  const updateData: Record<string, unknown> = { extraction_status: status }
  if (error) {
    updateData.extraction_error = error
  }

  const { data, error: updateError } = await client
    .from(TABLE_NAME)
    .update(updateData)
    .eq("id", documentId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update document status: ${updateError.message}`)
  }

  return data as DocumentRecord
}

export async function updateDocumentExtraction(
  documentId: string,
  extraction: {
    storage_path?: string
    xfa_fields?: Record<string, unknown>
    page_count?: number
    form_type?: string
    document_type?: string
  }
): Promise<DocumentRecord> {
  const client = getSupabaseClient()
  
  const updateData: Record<string, unknown> = {
    extraction_status: "success",
    ...extraction,
  }

  const { data, error } = await client
    .from(TABLE_NAME)
    .update(updateData)
    .eq("id", documentId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update document extraction: ${error.message}`)
  }

  return data as DocumentRecord
}

export async function getDocumentsByStatus(
  sessionId: string,
  status: ExtractionStatus
): Promise<DocumentRecord[]> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .eq("extraction_status", status)

  if (error) {
    throw new Error(`Failed to get documents by status: ${error.message}`)
  }

  return data as DocumentRecord[]
}

export async function getDocumentStats(sessionId: string): Promise<{
  total: number
  success: number
  failed: number
  pending: number
  processing: number
  unsupported: number
}> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select("extraction_status")
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`Failed to get document stats: ${error.message}`)
  }

  const stats = {
    total: data.length,
    success: 0,
    failed: 0,
    pending: 0,
    processing: 0,
    unsupported: 0,
  }

  for (const row of data) {
    const status = row.extraction_status as ExtractionStatus
    if (status === "success") stats.success++
    else if (status === "failed") stats.failed++
    else if (status === "pending") stats.pending++
    else if (status === "processing") stats.processing++
    else if (status === "unsupported") stats.unsupported++
  }

  return stats
}
