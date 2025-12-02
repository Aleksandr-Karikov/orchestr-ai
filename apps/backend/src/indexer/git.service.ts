import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import simpleGit, { SimpleGit } from "simple-git";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import { Logger } from "../logger/logger.service";

export interface CloneOptions {
  branch?: string;
  depth?: number;
  sshKeyPath?: string;
  httpsToken?: string;
  httpsUsername?: string;
}

export interface CloneResult {
  localPath: string;
  repositoryUrl: string;
  branch?: string;
  commitHash?: string;
}

@Injectable()
export class GitService {
  private readonly tempDir: string;
  private readonly cleanupTTLDays: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    // Use configured temp directory or default to OS temp directory
    this.tempDir = this.configService.get<string>(
      "GIT_TEMP_DIR",
      path.join(os.tmpdir(), "orchestr-ai-repos"),
    );
    this.cleanupTTLDays = this.configService.get<number>(
      "GIT_CLEANUP_TTL_DAYS",
      7,
    );

    // Ensure temp directory exists
    this.ensureTempDirectory().catch((error) => {
      this.logger.error(
        { error: error.message, stack: error.stack },
        "Failed to create temp directory",
      );
    });
  }

  /**
   * Clone a Git repository to a temporary directory
   * @param repositoryUrl - Git repository URL (HTTPS or SSH)
   * @param options - Clone options (branch, depth, authentication)
   * @returns Promise resolving to clone result with local path
   */
  async cloneRepository(
    repositoryUrl: string,
    options: CloneOptions = {},
  ): Promise<CloneResult> {
    this.validateRepositoryUrl(repositoryUrl);

    const repositoryId = this.generateRepositoryId(repositoryUrl);
    const localPath = path.join(this.tempDir, repositoryId);

    try {
      // Ensure temp directory exists
      await this.ensureTempDirectory();

      // Check if repository already exists and clean it up if needed
      try {
        const stats = await fs.stat(localPath);
        if (stats.isDirectory()) {
          this.logger.logWithContext(
            "debug",
            "Removing existing repository directory",
            "GitService",
            { repositoryUrl, localPath },
          );
          await fs.rm(localPath, { recursive: true, force: true });
        }
      } catch {
        // Directory doesn't exist, which is fine
      }

      // Configure Git with authentication if provided
      const gitOptions = await this.prepareGitOptions(repositoryUrl, options);
      const urlToClone = gitOptions.modifiedUrl || repositoryUrl;

      this.logger.logWithContext(
        "log",
        `Cloning repository: ${repositoryUrl}`,
        "GitService",
        {
          repositoryUrl,
          localPath,
          branch: options.branch,
          hasAuth: !!(options.sshKeyPath || options.httpsToken),
        },
      );

      // Clone repository
      const git: SimpleGit = simpleGit();
      const cloneOptions: string[] = [];

      if (options.depth) {
        cloneOptions.push("--depth", options.depth.toString());
      }

      if (options.branch) {
        cloneOptions.push("--branch", options.branch);
      }

      // Clone with authentication
      if (gitOptions.env) {
        await git
          .env(gitOptions.env)
          .clone(urlToClone, localPath, cloneOptions);
      } else {
        await git.clone(urlToClone, localPath, cloneOptions);
      }

      // Get commit hash
      const gitInstance: SimpleGit = simpleGit(localPath);
      const commitHash = await gitInstance.revparse(["HEAD"]);

      this.logger.logWithContext(
        "log",
        `Successfully cloned repository: ${repositoryUrl}`,
        "GitService",
        {
          repositoryUrl,
          localPath,
          commitHash,
          branch: options.branch || "default",
        },
      );

      return {
        localPath,
        repositoryUrl,
        branch: options.branch,
        commitHash,
      };
    } catch (error) {
      // Clean up on failure
      try {
        await fs.rm(localPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }

      const errorMessage = this.extractErrorMessage(error);
      this.logger.error(
        {
          repositoryUrl,
          localPath,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to clone repository",
      );

      if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        throw new BadRequestException(
          `Repository not found or not accessible: ${repositoryUrl}`,
        );
      }

      if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("permission denied") ||
        errorMessage.includes("401") ||
        errorMessage.includes("403")
      ) {
        throw new BadRequestException(
          `Authentication failed for repository: ${repositoryUrl}. Please check your credentials.`,
        );
      }

      if (
        errorMessage.includes("network") ||
        errorMessage.includes("timeout")
      ) {
        throw new InternalServerErrorException(
          `Network error while cloning repository: ${repositoryUrl}. Please try again later.`,
        );
      }

      throw new InternalServerErrorException(
        `Failed to clone repository: ${repositoryUrl}. ${errorMessage}`,
      );
    }
  }

  /**
   * Clean up a cloned repository directory
   * @param localPath - Local path to the repository
   */
  async cleanupRepository(localPath: string): Promise<void> {
    try {
      await fs.rm(localPath, { recursive: true, force: true });
      this.logger.logWithContext(
        "debug",
        "Cleaned up repository directory",
        "GitService",
        { localPath },
      );
    } catch (error) {
      this.logger.warn(
        {
          localPath,
          error: error instanceof Error ? error.message : String(error),
        },
        "Failed to cleanup repository directory",
      );
    }
  }

  /**
   * Get repository information (branch, commit hash)
   * @param localPath - Local path to the repository
   */
  async getRepositoryInfo(localPath: string): Promise<{
    branch: string;
    commitHash: string;
    remoteUrl: string;
  }> {
    try {
      const git: SimpleGit = simpleGit(localPath);
      const [branch, commitHash, remotes] = await Promise.all([
        git.revparse(["--abbrev-ref", "HEAD"]),
        git.revparse(["HEAD"]),
        git.getRemotes(true),
      ]);

      const remoteUrl =
        remotes.find((r: { name: string }) => r.name === "origin")?.refs
          ?.fetch || "";

      return {
        branch,
        commitHash,
        remoteUrl,
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.logger.error(
        {
          localPath,
          error: errorMessage,
        },
        "Failed to get repository info",
      );
      throw new InternalServerErrorException(
        `Failed to get repository info: ${errorMessage}`,
      );
    }
  }

  /**
   * Detect Git provider from repository URL
   * Supports:
   * - GitHub (github.com)
   * - GitLab (gitlab.com or custom domains)
   * - Bitbucket Cloud (bitbucket.org)
   * - Bitbucket Server (custom domains with /scm/ path)
   */
  detectGitProvider(
    repositoryUrl: string,
  ): "github" | "gitlab" | "bitbucket" | "unknown" {
    const url = repositoryUrl.toLowerCase();

    // GitHub detection
    if (url.includes("github.com")) {
      return "github";
    }

    // GitLab detection (gitlab.com or custom GitLab instances)
    if (url.includes("gitlab.com") || url.includes("gitlab")) {
      return "gitlab";
    }

    // Bitbucket detection:
    // 1. Bitbucket Cloud (bitbucket.org)
    // 2. Bitbucket Server (custom domains with /scm/ path - characteristic of Bitbucket Server)
    if (url.includes("bitbucket.org") || url.includes("bitbucket")) {
      return "bitbucket";
    }

    // Bitbucket Server detection by /scm/ path
    // Bitbucket Server uses /scm/ in the URL path structure
    if (url.includes("/scm/")) {
      return "bitbucket";
    }

    return "unknown";
  }

  /**
   * Validate repository URL format
   */
  private validateRepositoryUrl(repositoryUrl: string): void {
    if (!repositoryUrl || typeof repositoryUrl !== "string") {
      throw new BadRequestException("Repository URL is required");
    }

    // Check for valid Git URL patterns
    const httpsPattern = /^https?:\/\/.+/;
    const sshPattern = /^(git@|ssh:\/\/).+/;
    const gitPattern = /^git:\/\/.+/;

    if (
      !httpsPattern.test(repositoryUrl) &&
      !sshPattern.test(repositoryUrl) &&
      !gitPattern.test(repositoryUrl)
    ) {
      throw new BadRequestException(
        `Invalid repository URL format: ${repositoryUrl}. Must be HTTPS, SSH, or Git URL.`,
      );
    }
  }

  /**
   * Generate a unique repository ID from URL
   */
  private generateRepositoryId(repositoryUrl: string): string {
    // Remove protocol and normalize URL
    const normalized = repositoryUrl
      .replace(/^https?:\/\//, "")
      .replace(/^git@/, "")
      .replace(/:/g, "/")
      .replace(/\.git$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_");

    // Add hash for uniqueness
    const hash = crypto
      .createHash("md5")
      .update(repositoryUrl)
      .digest("hex")
      .substring(0, 8);

    return `${normalized}_${hash}`;
  }

  /**
   * Prepare Git options with authentication
   */
  private async prepareGitOptions(
    repositoryUrl: string,
    options: CloneOptions,
  ): Promise<{ env?: Record<string, string>; modifiedUrl?: string }> {
    const env: Record<string, string> = {};
    // Copy only string values from process.env
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }
    let modifiedUrl: string | undefined;

    // SSH key authentication
    if (options.sshKeyPath) {
      try {
        const keyStats = await fs.stat(options.sshKeyPath);
        if (!keyStats.isFile()) {
          throw new BadRequestException(
            `SSH key path is not a file: ${options.sshKeyPath}`,
          );
        }

        // Set SSH key for Git operations
        env.GIT_SSH_COMMAND = `ssh -i ${options.sshKeyPath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`;
        this.logger.logWithContext(
          "debug",
          "Using SSH key for authentication",
          "GitService",
          { sshKeyPath: options.sshKeyPath },
        );
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(
          `SSH key file not found: ${options.sshKeyPath}`,
        );
      }
    }

    // HTTPS token authentication
    if (options.httpsToken && repositoryUrl.startsWith("http")) {
      const provider = this.detectGitProvider(repositoryUrl);
      const username =
        options.httpsUsername || this.getDefaultUsername(provider);

      // Embed token in URL if not already present
      if (!repositoryUrl.includes("@")) {
        // Modify URL to include token
        modifiedUrl = repositoryUrl.replace(
          /^(https?:\/\/)(.+)$/,
          `$1${username}:${options.httpsToken}@$2`,
        );

        this.logger.logWithContext(
          "debug",
          "Using HTTPS token for authentication",
          "GitService",
          { provider, username: username ? "***" : undefined },
        );
      }
    }

    const hasEnvChanges =
      Object.keys(env).length > Object.keys(process.env).length ||
      options.sshKeyPath;
    if (hasEnvChanges || modifiedUrl) {
      return { env: hasEnvChanges ? env : undefined, modifiedUrl };
    }
    return {};
  }

  /**
   * Get default username for Git provider
   */
  private getDefaultUsername(
    provider: "github" | "gitlab" | "bitbucket" | "unknown",
  ): string {
    switch (provider) {
      case "github":
        return "git";
      case "gitlab":
        return "git";
      case "bitbucket":
        return "git";
      default:
        return "git";
    }
  }

  /**
   * Ensure temp directory exists
   */
  private async ensureTempDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      this.logger.error(
        {
          tempDir: this.tempDir,
          error: error instanceof Error ? error.message : String(error),
        },
        "Failed to create temp directory",
      );
      throw new InternalServerErrorException(
        `Failed to create temp directory: ${this.tempDir}`,
      );
    }
  }

  /**
   * Extract error message from error object
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "Unknown error";
  }
}
