import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface WebsiteRequest {
  url: string;
  max_pages?: number;
  force_crawl?: boolean;
}

interface ReportGenerationRequest {
  pages_text: string;
  retries?: number;
}

interface VerticalMarketCheckRequest {
  report_text: string;
  retries?: number;
}

interface Api {
  scrapeWebsite: (params: WebsiteRequest) => Promise<void>;
  loadScrapedContent: (maxPages?: number) => Promise<string>;
  generateReport: (data: ReportGenerationRequest) => Promise<any>;
  checkVerticalMarket: (data: VerticalMarketCheckRequest) => Promise<any>;
}

export const api: Api = {
  scrapeWebsite: async (data: WebsiteRequest) => {
    const response = await axios.post(`${API_BASE_URL}/scrape/scrape`, data);
    return response.data;
  },

  loadScrapedContent: async (maxPages?: number) => {
    const response = await axios.get(`${API_BASE_URL}/scrape/load`, {
      params: { max_pages: maxPages }
    });
    return response.data;
  },

  generateReport: async (data: ReportGenerationRequest) => {
    const response = await axios.post(`${API_BASE_URL}/report/generate-report`, data);
    return response.data;
  },

  checkVerticalMarket: async (data: VerticalMarketCheckRequest) => {
    const response = await axios.post(`${API_BASE_URL}/vertical-market-check/vertical-market-check`, data);
    return response.data;
  }
}; 