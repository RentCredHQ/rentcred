import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    agentProfile: {
      create: jest.fn(),
    },
    tenantProfile: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailService = {
    sendEmailVerification: jest.fn(),
    sendPasswordReset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!',
      role: 'agent' as const,
    };

    it('should successfully register a new agent', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        ...registerDto,
        passwordHash: 'hashed',
        isVerified: false,
        emailVerifyToken: 'token123',
        createdAt: new Date(),
      });
      mockPrismaService.agentProfile.create.mockResolvedValue({
        id: '1',
        userId: '1',
      });
      mockJwtService.sign.mockReturnValue('jwt-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('jwt-token');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.agentProfile.create).toHaveBeenCalled();
      expect(mockMailService.sendEmailVerification).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should create tenant profile for tenant role', async () => {
      const tenantDto = { ...registerDto, role: 'tenant' as const };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        ...tenantDto,
        passwordHash: 'hashed',
      });
      mockPrismaService.tenantProfile.create.mockResolvedValue({
        id: '1',
        userId: '1',
      });
      mockJwtService.sign.mockReturnValue('jwt-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await service.register(tenantDto);

      expect(mockPrismaService.tenantProfile.create).toHaveBeenCalled();
      expect(mockPrismaService.agentProfile.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password1!',
    };

    const mockUser = {
      id: '1',
      email: loginDto.email,
      name: 'Test User',
      role: 'agent',
      passwordHash: 'hashed',
      isVerified: true,
    };

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('jwt-token');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    const token = 'valid-token';
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      emailVerifyToken: token,
      emailVerifyExpires: new Date(Date.now() + 60000), // Future date
    };

    it('should successfully verify email with valid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        isVerified: true,
        emailVerifyToken: null,
      });

      const result = await service.verifyEmail(token);

      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          isVerified: true,
          emailVerifyToken: null,
          emailVerifyExpires: null,
        },
      });
    });

    it('should throw BadRequestException with invalid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with expired token', async () => {
      // Prisma's { gt: new Date() } filter means expired tokens return null
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';
    const mockUser = {
      id: '1',
      email,
      name: 'Test User',
    };

    it('should send reset email for valid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({ message: 'If the email exists, a reset link has been sent' });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockMailService.sendPasswordReset).toHaveBeenCalled();
    });

    it('should return same message for non-existent email (prevent enumeration)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toEqual({ message: 'If the email exists, a reset link has been sent' });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const token = 'reset-token';
    const newPassword = 'NewPass1!';
    const mockUser = {
      id: '1',
      resetToken: token,
      resetTokenExpires: new Date(Date.now() + 60000),
    };

    it('should successfully reset password with valid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          passwordHash: 'new-hashed',
          resetToken: null,
          resetTokenExpires: null,
        },
      });
    });

    it('should throw BadRequestException with short password', async () => {
      await expect(service.resetPassword(token, 'short')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with invalid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword('invalid', newPassword)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getProfile', () => {
    const userId = '1';
    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      role: 'agent',
      isVerified: true,
      createdAt: new Date(),
    };

    it('should return user profile', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(UnauthorizedException);
    });
  });
});
