import { readFileSync, statSync } from "fs"
import { basename, extname } from "path"
import { buildStoragePath, uploadFile, downloadFile, getSignedUrl } from "./client"
import { storagePaths } from "../types"

export interface UploadDocumentResult {
  storagePath: string
  filename: string
  fileSize: number
  fileType: string
}

export async function uploadSourceDocument(
  sessionId: string,
  localPath: string
): Promise<UploadDocumentResult> {
  const filename = basename(localPath)
  const fileContent = readFileSync(localPath)
  const stats = statSync(localPath)
  const fileType = extname(localPath).slice(1).toLowerCase()
  
  const storagePath = storagePaths.source(sessionId, filename)
  
  await uploadFile(storagePath, fileContent, {
    contentType: getContentType(fileType),
    upsert: true,
  })

  return {
    storagePath,
    filename,
    fileSize: stats.size,
    fileType,
  }
}

export async function uploadExtractedContent(
  sessionId: string,
  originalFilename: string,
  content: string
): Promise<string> {
  const mdFilename = originalFilename.replace(/\.[^.]+$/, ".md")
  const storagePath = storagePaths.extracted(sessionId, mdFilename)
  
  await uploadFile(storagePath, content, {
    contentType: "text/markdown",
    upsert: true,
  })

  return storagePath
}

export async function uploadReport(
  sessionId: string,
  version: number,
  content: string | Buffer,
  format: "md" | "pdf" | "json"
): Promise<string> {
  const storagePath = storagePaths.report(sessionId, version, format)
  
  const contentType = format === "md" 
    ? "text/markdown"
    : format === "pdf"
    ? "application/pdf"
    : "application/json"
  
  await uploadFile(storagePath, content, {
    contentType,
    upsert: true,
  })

  return storagePath
}

export async function uploadAgentOutput(
  sessionId: string,
  stage: string,
  output: Record<string, unknown>
): Promise<string> {
  const storagePath = storagePaths.agentOutput(sessionId, stage)
  const content = JSON.stringify(output, null, 2)
  
  await uploadFile(storagePath, content, {
    contentType: "application/json",
    upsert: true,
  })

  return storagePath
}

export async function downloadDocument(storagePath: string): Promise<Buffer> {
  const blob = await downloadFile(storagePath)
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function getDocumentUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(storagePath, expiresIn)
}

function getContentType(fileType: string): string {
  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    txt: "text/plain",
    md: "text/markdown",
    json: "application/json",
    csv: "text/csv",
    xml: "application/xml",
  }
  
  return contentTypes[fileType] || "application/octet-stream"
}
