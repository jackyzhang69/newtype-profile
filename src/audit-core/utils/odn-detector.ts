import type { RefusalAnalysis } from "../types/case-profile"

interface ExtractedDocument {
  filename: string
  content: string
  format?: string
}

export function detectRefusalAnalysis(
  documents: ExtractedDocument[]
): RefusalAnalysis {
  const imm0276 = findIMM0276(documents)

  if (!imm0276) {
    return {
      has_refusal_letter: hasRefusalLetter(documents),
      has_imm0276: false,
      has_odn: false,
      needs_gcms: true,
    }
  }

  const odnContent = extractODNContent(imm0276.content)
  const hasODN = odnContent !== null

  return {
    has_refusal_letter: true,
    refusal_date: extractRefusalDate(imm0276.content),
    has_imm0276: true,
    has_odn: hasODN,
    odn_content: odnContent || undefined,
    officer_concerns: hasODN ? parseOfficerConcerns(odnContent) : undefined,
    needs_gcms: !hasODN,
    imm0276_version: extractFormVersion(imm0276.content),
  }
}

function findIMM0276(documents: ExtractedDocument[]): ExtractedDocument | null {
  return (
    documents.find((doc) => {
      const filename = doc.filename.toLowerCase()
      return (
        filename.includes("imm0276") ||
        filename.includes("imm 0276") ||
        filename.includes("refusal notes") ||
        filename.includes("refusal_notes")
      )
    }) || null
  )
}

function hasRefusalLetter(documents: ExtractedDocument[]): boolean {
  return documents.some((doc) => {
    const filename = doc.filename.toLowerCase()
    return (
      filename.includes("refusal") ||
      filename.includes("imm5621") ||
      filename.includes("imm 5621")
    )
  })
}

function extractODNContent(content: string): string | null {
  const startMarkers = [
    "I have reviewed the application",
    "• I have reviewed the application",
    "Officer Decision Notes",
    "These notes were entered by the officer",
  ]

  const endMarkers = [
    "For the reasons above, I have refused this application",
    "I have refused this application",
  ]

  let startIndex = -1
  for (const marker of startMarkers) {
    const index = content.indexOf(marker)
    if (index !== -1) {
      startIndex = index
      break
    }
  }

  if (startIndex === -1) {
    return null
  }

  let endIndex = -1
  for (const marker of endMarkers) {
    const index = content.indexOf(marker, startIndex)
    if (index !== -1) {
      endIndex = index + marker.length
      break
    }
  }

  if (endIndex === -1) {
    return null
  }

  return content.substring(startIndex, endIndex).trim()
}

function parseOfficerConcerns(odnContent: string): string[] {
  const concerns: string[] = []

  const patterns = [
    /It is not evident why/gi,
    /I am not satisfied/gi,
    /has failed to satisfy me/gi,
    /I also note that/gi,
    /does not seem reasonable/gi,
    /is general and does not outline/gi,
  ]

  const lines = odnContent.split("\n")
  let currentConcern = ""

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const hasPattern = patterns.some((pattern) => pattern.test(trimmed))

    if (hasPattern) {
      if (currentConcern) {
        concerns.push(currentConcern.trim())
      }
      currentConcern = trimmed
    } else if (currentConcern) {
      currentConcern += " " + trimmed
    }
  }

  if (currentConcern) {
    concerns.push(currentConcern.trim())
  }

  return concerns.filter((c) => c.length > 20)
}

function extractRefusalDate(content: string): string | undefined {
  const isoPattern = /(?:Decision\s+)?Date:\s*(\d{4}-\d{2}-\d{2})/i
  const isoMatch = content.match(isoPattern)
  
  if (isoMatch) {
    return isoMatch[1]
  }

  const textPattern = /(?:Decision\s+)?Date:\s*([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i
  const textMatch = content.match(textPattern)

  if (textMatch) {
    const dateStr = textMatch[1]
    try {
      const date = new Date(dateStr)
      return date.toISOString().split("T")[0]
    } catch {
      return undefined
    }
  }

  return undefined
}

function extractFormVersion(content: string): string | undefined {
  const versionPattern = /IMM\s*0276\s*\((\d{2}-\d{4})\)/i
  const match = content.match(versionPattern)
  return match ? match[1] : undefined
}
