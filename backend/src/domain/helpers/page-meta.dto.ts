export class PageMetaDto {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  
    constructor(totalItems: number, page: number, limit: number, totalPages: number) {
      this.totalItems = totalItems;
      this.page = page;
      this.limit = limit;
      this.totalPages = totalPages;
    }
  }