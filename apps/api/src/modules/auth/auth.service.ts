import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;
const EMAIL_VERIFY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const emailVerifyToken = randomUUID();
    const emailVerifyExpires = new Date(Date.now() + EMAIL_VERIFY_EXPIRY_MS);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role,
        emailVerifyToken,
        emailVerifyExpires,
      },
    });

    // Create role-specific profile
    if (dto.role === 'agent') {
      await this.prisma.agentProfile.create({
        data: { userId: user.id },
      });
    } else if (dto.role === 'tenant') {
      await this.prisma.tenantProfile.create({
        data: { userId: user.id },
      });
    }

    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    // Send verification email (fire-and-forget)
    this.mailService.sendEmailVerification(user.email, user.name, emailVerifyToken);

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        agentProfile: {
          select: {
            kybStatus: true,
            creditBalance: true,
            companyName: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('User not found');

    // Flatten agent profile fields for frontend convenience
    const { agentProfile, ...rest } = user;
    return {
      ...rest,
      ...(agentProfile ? {
        kybStatus: agentProfile.kybStatus,
        creditBalance: agentProfile.creditBalance,
        companyName: agentProfile.companyName,
      } : {}),
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return same response to prevent email enumeration
    const response = { message: 'If the email exists, a reset link has been sent' };

    if (!user) return response;

    const resetToken = randomUUID();
    const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    });

    // Send reset email (fire-and-forget)
    this.mailService.sendPasswordReset(user.email, user.name, resetToken);

    return response;
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/.test(newPassword)) {
      throw new BadRequestException('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Password reset successfully' };
  }
}
