import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { Logger } from './logger.service';

describe('Logger', () => {
  let service: Logger;
  let pinoLogger: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    const mockPinoLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Logger,
        {
          provide: PinoLogger,
          useValue: mockPinoLogger,
        },
      ],
    }).compile();

    service = module.get<Logger>(Logger);
    pinoLogger = module.get(PinoLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should call pinoLogger.info with message and context', () => {
      const message = 'Test log message';
      const context = 'TestContext';

      service.log(message, context);

      expect(pinoLogger.info).toHaveBeenCalledWith(
        { context },
        message,
      );
    });

    it('should call pinoLogger.info without context when context is undefined', () => {
      const message = 'Test log message';

      service.log(message);

      expect(pinoLogger.info).toHaveBeenCalledWith(
        { context: undefined },
        message,
      );
    });
  });

  describe('error', () => {
    describe('structured logging overload', () => {
      it('should call pinoLogger.error with context object and message', () => {
        const context = { userId: '123', action: 'test' };
        const message = 'Error occurred';

        service.error(context, message);

        expect(pinoLogger.error).toHaveBeenCalledWith(context, message);
      });
    });

    describe('standard NestJS LoggerService interface', () => {
      it('should call pinoLogger.error with message, trace, and context', () => {
        const message = 'Error message';
        const trace = 'Error trace';
        const context = 'ErrorContext';

        service.error(message, trace, context);

        expect(pinoLogger.error).toHaveBeenCalledWith(
          { context, trace },
          message,
        );
      });

      it('should call pinoLogger.error without trace when trace is undefined', () => {
        const message = 'Error message';
        const context = 'ErrorContext';

        service.error(message, undefined, context);

        expect(pinoLogger.error).toHaveBeenCalledWith(
          { context, trace: undefined },
          message,
        );
      });

      it('should call pinoLogger.error without context when context is undefined', () => {
        const message = 'Error message';
        const trace = 'Error trace';

        service.error(message, trace);

        expect(pinoLogger.error).toHaveBeenCalledWith(
          { context: undefined, trace },
          message,
        );
      });
    });
  });

  describe('warn', () => {
    describe('structured logging overload', () => {
      it('should call pinoLogger.warn with context object and message', () => {
        const context = { userId: '123', action: 'test' };
        const message = 'Warning message';

        service.warn(context, message);

        expect(pinoLogger.warn).toHaveBeenCalledWith(context, message);
      });
    });

    describe('standard NestJS LoggerService interface', () => {
      it('should call pinoLogger.warn with message and context', () => {
        const message = 'Warning message';
        const context = 'WarningContext';

        service.warn(message, context);

        expect(pinoLogger.warn).toHaveBeenCalledWith(
          { context },
          message,
        );
      });

      it('should call pinoLogger.warn without context when context is undefined', () => {
        const message = 'Warning message';

        service.warn(message);

        expect(pinoLogger.warn).toHaveBeenCalledWith(
          { context: undefined },
          message,
        );
      });
    });
  });

  describe('debug', () => {
    it('should call pinoLogger.debug with message and context', () => {
      const message = 'Debug message';
      const context = 'DebugContext';

      service.debug(message, context);

      expect(pinoLogger.debug).toHaveBeenCalledWith(
        { context },
        message,
      );
    });

    it('should call pinoLogger.debug without context when context is undefined', () => {
      const message = 'Debug message';

      service.debug(message);

      expect(pinoLogger.debug).toHaveBeenCalledWith(
        { context: undefined },
        message,
      );
    });
  });

  describe('verbose', () => {
    it('should call pinoLogger.trace with message and context', () => {
      const message = 'Verbose message';
      const context = 'VerboseContext';

      service.verbose(message, context);

      expect(pinoLogger.trace).toHaveBeenCalledWith(
        { context },
        message,
      );
    });

    it('should call pinoLogger.trace without context when context is undefined', () => {
      const message = 'Verbose message';

      service.verbose(message);

      expect(pinoLogger.trace).toHaveBeenCalledWith(
        { context: undefined },
        message,
      );
    });
  });

  describe('logWithContext', () => {
    describe('log level', () => {
      it('should call logger.info with metadata when metadata is provided', () => {
        const message = 'Log message';
        const context = 'LogContext';
        const metadata = { key: 'value' };

        service.logWithContext('log', message, context, metadata);

        expect(pinoLogger.info).toHaveBeenCalledWith(
          { context, ...metadata },
          message,
        );
      });

      it('should call log method when metadata is not provided', () => {
        const message = 'Log message';
        const context = 'LogContext';
        const logSpy = jest.spyOn(service, 'log');

        service.logWithContext('log', message, context);

        expect(logSpy).toHaveBeenCalledWith(message, context);
      });
    });

    describe('error level', () => {
      it('should call logger.error with metadata when metadata is provided', () => {
        const message = 'Error message';
        const context = 'ErrorContext';
        const metadata = { key: 'value' };

        service.logWithContext('error', message, context, metadata);

        expect(pinoLogger.error).toHaveBeenCalledWith(
          { context, ...metadata },
          message,
        );
      });

      it('should call error method when metadata is not provided', () => {
        const message = 'Error message';
        const context = 'ErrorContext';
        const errorSpy = jest.spyOn(service, 'error');

        service.logWithContext('error', message, context);

        expect(errorSpy).toHaveBeenCalledWith(message, undefined, context);
      });
    });

    describe('warn level', () => {
      it('should call logger.warn with metadata when metadata is provided', () => {
        const message = 'Warning message';
        const context = 'WarningContext';
        const metadata = { key: 'value' };

        service.logWithContext('warn', message, context, metadata);

        expect(pinoLogger.warn).toHaveBeenCalledWith(
          { context, ...metadata },
          message,
        );
      });

      it('should call warn method when metadata is not provided', () => {
        const message = 'Warning message';
        const context = 'WarningContext';
        const warnSpy = jest.spyOn(service, 'warn');

        service.logWithContext('warn', message, context);

        expect(warnSpy).toHaveBeenCalledWith(message, context);
      });
    });

    describe('debug level', () => {
      it('should call logger.debug with metadata when metadata is provided', () => {
        const message = 'Debug message';
        const context = 'DebugContext';
        const metadata = { key: 'value' };

        service.logWithContext('debug', message, context, metadata);

        expect(pinoLogger.debug).toHaveBeenCalledWith(
          { context, ...metadata },
          message,
        );
      });

      it('should call debug method when metadata is not provided', () => {
        const message = 'Debug message';
        const context = 'DebugContext';
        const debugSpy = jest.spyOn(service, 'debug');

        service.logWithContext('debug', message, context);

        expect(debugSpy).toHaveBeenCalledWith(message, context);
      });
    });

    describe('verbose level', () => {
      it('should call logger.trace with metadata when metadata is provided', () => {
        const message = 'Verbose message';
        const context = 'VerboseContext';
        const metadata = { key: 'value' };

        service.logWithContext('verbose', message, context, metadata);

        expect(pinoLogger.trace).toHaveBeenCalledWith(
          { context, ...metadata },
          message,
        );
      });

      it('should call verbose method when metadata is not provided', () => {
        const message = 'Verbose message';
        const context = 'VerboseContext';
        const verboseSpy = jest.spyOn(service, 'verbose');

        service.logWithContext('verbose', message, context);

        expect(verboseSpy).toHaveBeenCalledWith(message, context);
      });
    });
  });
});

