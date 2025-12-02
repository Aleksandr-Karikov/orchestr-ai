import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { GitService, CloneOptions } from "./git.service";
import { Logger } from "../logger/logger.service";
import * as fs from "fs/promises";
import * as os from "os";
import simpleGit, { SimpleGit } from "simple-git";

// Mock simple-git
jest.mock("simple-git");
jest.mock("fs/promises");
jest.mock("os");

describe("GitService", () => {
  let service: GitService;
  let logger: jest.Mocked<Logger>;
  let mockGit: jest.Mocked<SimpleGit>;

  const mockTempDir = "/tmp/test-repos";
  const mockRepositoryUrl = "https://github.com/test/repo.git";

  beforeEach(async () => {
    // Mock ConfigService
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === "GIT_TEMP_DIR") return mockTempDir;
        if (key === "GIT_CLEANUP_TTL_DAYS") return 7;
        return defaultValue;
      }),
    };

    // Mock Logger
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logWithContext: jest.fn(),
    };

    // Mock simple-git
    mockGit = {
      clone: jest.fn().mockResolvedValue(undefined),
      env: jest.fn().mockReturnThis(),
      revparse: jest.fn().mockResolvedValue("abc123"),
      getRemotes: jest.fn().mockResolvedValue([
        {
          name: "origin",
          refs: { fetch: mockRepositoryUrl, push: mockRepositoryUrl },
        },
      ]),
    } as unknown as jest.Mocked<SimpleGit>;

    (simpleGit as jest.Mock).mockReturnValue(mockGit);

    // Mock os.tmpdir
    (os.tmpdir as jest.Mock).mockReturnValue("/tmp");

    // Mock fs.promises
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockRejectedValue(new Error("ENOENT"));
    (fs.rm as jest.Mock).mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<GitService>(GitService);
    logger = module.get(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("cloneRepository", () => {
    it("should clone a repository successfully", async () => {
      const result = await service.cloneRepository(mockRepositoryUrl);

      expect(result).toMatchObject({
        repositoryUrl: mockRepositoryUrl,
        localPath: expect.stringContaining(mockTempDir),
      });
      expect(mockGit.clone).toHaveBeenCalled();
      expect(mockGit.revparse).toHaveBeenCalledWith(["HEAD"]);
    });

    it("should clone with branch option", async () => {
      const options: CloneOptions = { branch: "main" };
      await service.cloneRepository(mockRepositoryUrl, options);

      expect(mockGit.clone).toHaveBeenCalledWith(
        mockRepositoryUrl,
        expect.any(String),
        ["--branch", "main"],
      );
    });

    it("should clone with depth option", async () => {
      const options: CloneOptions = { depth: 1 };
      await service.cloneRepository(mockRepositoryUrl, options);

      expect(mockGit.clone).toHaveBeenCalledWith(
        mockRepositoryUrl,
        expect.any(String),
        ["--depth", "1"],
      );
    });

    it("should clone with SSH key authentication", async () => {
      const sshKeyPath = "/path/to/ssh/key";
      const options: CloneOptions = { sshKeyPath };

      // Mock fs.stat sequence: first for directory check (not exists), then for SSH key file (exists)
      (fs.stat as jest.Mock)
        .mockRejectedValueOnce(new Error("ENOENT")) // Directory doesn't exist
        .mockResolvedValueOnce({ isFile: () => true }); // SSH key file exists

      await service.cloneRepository(mockRepositoryUrl, options);

      expect(mockGit.env).toHaveBeenCalled();
      const envCall = mockGit.env.mock.calls[0][0] as Record<string, string>;
      expect(envCall.GIT_SSH_COMMAND).toContain(sshKeyPath);
    });

    it("should clone with HTTPS token authentication", async () => {
      const options: CloneOptions = {
        httpsToken: "token123",
        httpsUsername: "user",
      };

      await service.cloneRepository(mockRepositoryUrl, options);

      // Should modify URL to include token
      expect(mockGit.clone).toHaveBeenCalled();
      const cloneCall = mockGit.clone.mock.calls[0];
      expect(cloneCall[0]).toContain("user:token123@");
    });

    it("should throw BadRequestException for invalid URL", async () => {
      await expect(service.cloneRepository("invalid-url")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException for empty URL", async () => {
      await expect(service.cloneRepository("")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should handle repository not found error", async () => {
      mockGit.clone.mockRejectedValueOnce(new Error("not found"));

      await expect(service.cloneRepository(mockRepositoryUrl)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should handle authentication error", async () => {
      mockGit.clone.mockRejectedValueOnce(new Error("authentication failed"));

      await expect(service.cloneRepository(mockRepositoryUrl)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should handle network error", async () => {
      mockGit.clone.mockRejectedValueOnce(new Error("network timeout"));

      await expect(service.cloneRepository(mockRepositoryUrl)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("should cleanup existing directory before cloning", async () => {
      // Mock existing directory
      (fs.stat as jest.Mock).mockResolvedValueOnce({ isDirectory: () => true });

      await service.cloneRepository(mockRepositoryUrl);

      expect(fs.rm).toHaveBeenCalled();
    });

    it("should cleanup on clone failure", async () => {
      mockGit.clone.mockRejectedValueOnce(new Error("clone failed"));

      try {
        await service.cloneRepository(mockRepositoryUrl);
      } catch {
        // Expected to throw
      }

      // Should attempt cleanup
      expect(fs.rm).toHaveBeenCalled();
    });
  });

  describe("cleanupRepository", () => {
    it("should cleanup repository directory", async () => {
      const localPath = "/tmp/test-repo";
      await service.cleanupRepository(localPath);

      expect(fs.rm).toHaveBeenCalledWith(localPath, {
        recursive: true,
        force: true,
      });
    });

    it("should handle cleanup errors gracefully", async () => {
      (fs.rm as jest.Mock).mockRejectedValueOnce(new Error("cleanup failed"));

      await expect(
        service.cleanupRepository("/tmp/test-repo"),
      ).resolves.not.toThrow();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("getRepositoryInfo", () => {
    it("should get repository information", async () => {
      const localPath = "/tmp/test-repo";
      const gitInstance = simpleGit(localPath);
      (gitInstance.revparse as jest.Mock).mockResolvedValueOnce("main");
      (gitInstance.revparse as jest.Mock).mockResolvedValueOnce("abc123");

      const info = await service.getRepositoryInfo(localPath);

      expect(info).toMatchObject({
        branch: "main",
        commitHash: "abc123",
        remoteUrl: mockRepositoryUrl,
      });
    });

    it("should throw InternalServerErrorException on failure", async () => {
      const localPath = "/tmp/test-repo";
      const gitInstance = simpleGit(localPath);
      (gitInstance.revparse as jest.Mock).mockRejectedValueOnce(
        new Error("git error"),
      );

      await expect(service.getRepositoryInfo(localPath)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("detectGitProvider", () => {
    it("should detect GitHub", () => {
      expect(
        service.detectGitProvider("https://github.com/user/repo.git"),
      ).toBe("github");
    });

    it("should detect GitLab", () => {
      expect(
        service.detectGitProvider("https://gitlab.com/user/repo.git"),
      ).toBe("gitlab");
    });

    it("should detect Bitbucket", () => {
      expect(
        service.detectGitProvider("https://bitbucket.org/user/repo.git"),
      ).toBe("bitbucket");
    });

    it("should detect Bitbucket Server by /scm/ path", () => {
      expect(
        service.detectGitProvider(
          "https://git.moscow.alfaintra.net/scm/alfagen/alfa-lead-web-ui.git",
        ),
      ).toBe("bitbucket");
    });

    it("should detect Bitbucket Server with custom domain", () => {
      expect(
        service.detectGitProvider(
          "https://git.company.com/scm/project/repo.git",
        ),
      ).toBe("bitbucket");
    });

    it("should return unknown for unrecognized provider", () => {
      expect(
        service.detectGitProvider("https://example.com/user/repo.git"),
      ).toBe("unknown");
    });
  });

  describe("validateRepositoryUrl", () => {
    it("should accept HTTPS URLs", async () => {
      await expect(
        service.cloneRepository("https://github.com/user/repo.git"),
      ).resolves.toBeDefined();
    });

    it("should accept SSH URLs", async () => {
      await expect(
        service.cloneRepository("git@github.com:user/repo.git"),
      ).resolves.toBeDefined();
    });

    it("should accept git:// URLs", async () => {
      await expect(
        service.cloneRepository("git://github.com/user/repo.git"),
      ).resolves.toBeDefined();
    });
  });

  describe("SSH key validation", () => {
    it("should throw BadRequestException if SSH key file does not exist", async () => {
      const options: CloneOptions = { sshKeyPath: "/nonexistent/key" };
      (fs.stat as jest.Mock).mockRejectedValueOnce(new Error("ENOENT"));

      await expect(
        service.cloneRepository(mockRepositoryUrl, options),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if SSH key path is not a file", async () => {
      const options: CloneOptions = { sshKeyPath: "/path/to/directory" };
      (fs.stat as jest.Mock).mockResolvedValueOnce({ isFile: () => false });

      await expect(
        service.cloneRepository(mockRepositoryUrl, options),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
