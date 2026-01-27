import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import {
  SERVER_CONFIG,
  SERVICE_PORTS,
  resolveServiceUrls,
  getServiceUrl,
  getServiceUrlsWithFallback,
} from "./service-urls"

describe("Service URL Configuration", () => {
  const originalEnv = {
    FILE_CONTENT_BASE_URL: process.env.FILE_CONTENT_BASE_URL,
    AUDIT_KG_BASE_URL: process.env.AUDIT_KG_BASE_URL,
  }

  beforeEach(() => {
    delete process.env.FILE_CONTENT_BASE_URL
    delete process.env.AUDIT_KG_BASE_URL
  })

  afterEach(() => {
    if (originalEnv.FILE_CONTENT_BASE_URL) {
      process.env.FILE_CONTENT_BASE_URL = originalEnv.FILE_CONTENT_BASE_URL
    } else {
      delete process.env.FILE_CONTENT_BASE_URL
    }
    if (originalEnv.AUDIT_KG_BASE_URL) {
      process.env.AUDIT_KG_BASE_URL = originalEnv.AUDIT_KG_BASE_URL
    } else {
      delete process.env.AUDIT_KG_BASE_URL
    }
  })

  describe("SERVER_CONFIG", () => {
    it("#given SERVER_CONFIG #when accessed #then returns correct values", () => {
      expect(SERVER_CONFIG.LAN_IP).toBe("192.168.1.98")
      expect(SERVER_CONFIG.PUBLIC_DOMAIN).toBe("es_search.jackyzhang.app")
      expect(SERVER_CONFIG.API_PATH).toBe("/api/v1")
    })
  })

  describe("SERVICE_PORTS", () => {
    it("#given SERVICE_PORTS #when accessed #then returns correct port numbers", () => {
      expect(SERVICE_PORTS.FILE_CONTENT).toBe(3104)
      expect(SERVICE_PORTS.CASELAW).toBe(3105)
      expect(SERVICE_PORTS.EMAIL_KG).toBe(3106)
      expect(SERVICE_PORTS.OPERATION_MANUAL).toBe(3107)
      expect(SERVICE_PORTS.NOC).toBe(3108)
      expect(SERVICE_PORTS.HELP_CENTRE).toBe(3109)
    })
  })

  describe("resolveServiceUrls", () => {
    it("#given no env vars #when resolve fileContent #then returns LAN and public URLs", () => {
      const urls = resolveServiceUrls("fileContent")
      
      expect(urls).toContain("http://192.168.1.98:3104/api/v1")
      expect(urls).toContain("https://es_search.jackyzhang.app:3104/api/v1")
      expect(urls).toContain("http://es_search.jackyzhang.app:3104/api/v1")
      expect(urls[0]).toBe("http://192.168.1.98:3104/api/v1")
    })

    it("#given FILE_CONTENT_BASE_URL env #when resolve #then prioritizes env var", () => {
      process.env.FILE_CONTENT_BASE_URL = "http://custom:3104/api/v1"
      
      const urls = resolveServiceUrls("fileContent")
      
      expect(urls[0]).toBe("http://custom:3104/api/v1")
      expect(urls).toContain("http://192.168.1.98:3104/api/v1")
    })

    it("#given AUDIT_KG_BASE_URL env #when resolve knowledgeGraph #then prioritizes env var", () => {
      process.env.AUDIT_KG_BASE_URL = "https://kg.example.com/api/v1"
      
      const urls = resolveServiceUrls("knowledgeGraph")
      
      expect(urls[0]).toBe("https://kg.example.com/api/v1")
    })

    it("#given trailing slash in env #when resolve #then removes trailing slash", () => {
      process.env.FILE_CONTENT_BASE_URL = "http://custom:3104/api/v1/"
      
      const urls = resolveServiceUrls("fileContent")
      
      expect(urls[0]).toBe("http://custom:3104/api/v1")
    })
  })

  describe("getServiceUrl", () => {
    it("#given no env vars #when get fileContent URL #then returns LAN URL", () => {
      const url = getServiceUrl("fileContent")
      
      expect(url).toBe("http://192.168.1.98:3104/api/v1")
    })

    it("#given env var #when get URL #then returns env var value", () => {
      process.env.FILE_CONTENT_BASE_URL = "http://test:3104/api/v1"
      
      const url = getServiceUrl("fileContent")
      
      expect(url).toBe("http://test:3104/api/v1")
    })
  })

  describe("getServiceUrlsWithFallback", () => {
    it("#given service name #when get URLs #then returns all fallback URLs", () => {
      const urls = getServiceUrlsWithFallback("fileContent")
      
      expect(urls.length).toBeGreaterThan(1)
      expect(urls[0]).toBe("http://192.168.1.98:3104/api/v1")
    })
  })

  describe("Service without public domain", () => {
    it("#given caselaw service #when resolve #then returns only LAN URL", () => {
      const urls = resolveServiceUrls("caselaw")
      
      expect(urls).toContain("http://192.168.1.98:3105/api/v1")
      expect(urls.length).toBe(1)
    })
  })
})
