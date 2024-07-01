import { PageMetaDto } from "./page-meta.dto";

export class Pagination<T> {
    constructor(
      public readonly items: T[],
      public readonly totalItems: number,
      public readonly page: number,
      public readonly limit: number,
      public readonly totalPages: number,
    ) {}
  
    static create<T>(items: T[], totalItems: number, page: number, limit: number): Pagination<T> {
      const totalPages = Math.ceil(totalItems / limit);
      return new Pagination<T>(items, totalItems, page, limit, totalPages);
    }
  
    toPageMetaDto(): PageMetaDto {
      return new PageMetaDto(this.totalItems, this.page, this.limit, this.totalPages);
    }
  }