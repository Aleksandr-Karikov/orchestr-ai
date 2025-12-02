import { Injectable } from "@nestjs/common";
import { SpringBootParser } from "./parsers/spring-boot/spring-boot.parser";
import { ExtractedContract } from "./parsers/spring-boot/types";

@Injectable()
export class ExtractorService {
  constructor(private readonly springBootParser: SpringBootParser) {}

  /**
   * Extract contracts from a repository
   * @param repositoryPath Path to the cloned repository
   * @returns Array of extracted contracts
   */
  async extractContracts(repositoryPath: string): Promise<ExtractedContract[]> {
    // Use Spring Boot parser for now (can be extended to support other frameworks)
    return this.springBootParser.extractContracts(repositoryPath);
  }
}
