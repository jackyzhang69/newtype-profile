import { getSupabaseClient, getStorageBucket } from "../client"

type FileBody = ArrayBuffer | ArrayBufferView | Blob | Buffer | File | FormData | NodeJS.ReadableStream | ReadableStream<Uint8Array> | URLSearchParams | string

export function getStorage() {
  return getSupabaseClient().storage
}

export function buildStoragePath(sessionId: string, ...pathParts: string[]): string {
  return [sessionId, ...pathParts].join("/")
}

export async function uploadFile(
  path: string,
  file: FileBody,
  options?: {
    contentType?: string
    upsert?: boolean
  }
): Promise<{ path: string; fullPath: string }> {
  const bucket = getStorageBucket()
  const storage = getStorage()
  
  const { data, error } = await storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  return {
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
  }
}

export async function downloadFile(path: string): Promise<Blob> {
  const bucket = getStorageBucket()
  const storage = getStorage()
  
  const { data, error } = await storage.from(bucket).download(path)

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`)
  }

  return data
}

export async function getPublicUrl(path: string): Promise<string> {
  const bucket = getStorageBucket()
  const storage = getStorage()
  
  const { data } = storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function getSignedUrl(
  path: string,
  expiresIn = 3600
): Promise<string> {
  const bucket = getStorageBucket()
  const storage = getStorage()
  
  const { data, error } = await storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

export async function deleteFile(path: string): Promise<void> {
  const bucket = getStorageBucket()
  const storage = getStorage()
  
  const { error } = await storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

export async function listFiles(
  prefix: string
): Promise<{ name: string; id: string | null; metadata: Record<string, unknown> | null }[]> {
  const bucket = getStorageBucket()
  const storage = getStorage()
  
  const { data, error } = await storage.from(bucket).list(prefix)

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}

export async function fileExists(path: string): Promise<boolean> {
  const bucket = getStorageBucket()
  const storage = getStorage()
  
  const pathParts = path.split("/")
  const filename = pathParts.pop()
  const folder = pathParts.join("/")
  
  const { data, error } = await storage.from(bucket).list(folder, {
    search: filename,
  })

  if (error) {
    return false
  }

  return data.some(file => file.name === filename)
}
