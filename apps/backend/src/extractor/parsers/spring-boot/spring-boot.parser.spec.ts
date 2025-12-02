import { Test, TestingModule } from "@nestjs/testing";
import { SpringBootParser } from "./spring-boot.parser";
import { Logger } from "../../../logger/logger.service";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("SpringBootParser", () => {
  let parser: SpringBootParser;
  let testDir: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpringBootParser,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    parser = module.get<SpringBootParser>(SpringBootParser);

    // Create temporary directory for tests
    testDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "spring-boot-parser-test-"),
    );
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("extractContracts", () => {
    it("should extract contracts from a simple controller", async () => {
      // Create test controller file
      const controllerContent = `
package com.example.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(new UserDto());
    }
    
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserDto dto) {
        return ResponseEntity.ok(new UserDto());
    }
}
`;

      const controllerPath = path.join(testDir, "UserController.java");
      fs.writeFileSync(controllerPath, controllerContent);

      const contracts = await parser.extractContracts(testDir);

      expect(contracts).toHaveLength(2);
      expect(contracts[0].httpMethod).toBe("GET");
      expect(contracts[0].path).toBe("/api/v1/users/{id}");
      expect(contracts[1].httpMethod).toBe("POST");
      expect(contracts[1].path).toBe("/api/v1/users");
    });

    it("should handle files with parse errors gracefully", async () => {
      // Create invalid Java file (syntax error that regex parser can't handle)
      const invalidContent = `
package com.example.controller;

@RestController
public class InvalidController {
    @GetMapping("/test")
    public String test() {
        // Missing closing brace - this will cause issues
`;

      const invalidPath = path.join(testDir, "InvalidController.java");
      fs.writeFileSync(invalidPath, invalidContent);

      // Should not throw, but may log warnings for incomplete parsing
      const contracts = await parser.extractContracts(testDir);

      // Regex-based parser may still extract some contracts even with syntax errors
      // So we just check that it doesn't crash
      expect(Array.isArray(contracts)).toBe(true);
    });

    it("should extract parameters correctly", async () => {
      const controllerContent = `
package com.example.controller;

@RestController
@RequestMapping("/api")
public class TestController {
    
    @GetMapping("/test")
    public String test(
        @PathVariable Long id,
        @RequestParam String name,
        @RequestParam(required = false) String optional
    ) {
        return "test";
    }
}
`;

      const controllerPath = path.join(testDir, "TestController.java");
      fs.writeFileSync(controllerPath, controllerContent);

      const contracts = await parser.extractContracts(testDir);

      expect(contracts).toHaveLength(1);
      expect(contracts[0].parameters?.path).toBeDefined();
      expect(contracts[0].parameters?.query).toBeDefined();
      expect(contracts[0].parameters?.query?.["name"]?.required).toBe(true);
      expect(contracts[0].parameters?.query?.["optional"]?.required).toBe(
        false,
      );
    });

    it("should skip non-controller classes", async () => {
      const serviceContent = `
package com.example.service;

public class UserService {
    public void doSomething() {
        // Not a controller
    }
}
`;

      const servicePath = path.join(testDir, "UserService.java");
      fs.writeFileSync(servicePath, serviceContent);

      const contracts = await parser.extractContracts(testDir);

      expect(contracts).toHaveLength(0);
    });
  });
});
