import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Req,
  Headers,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { PurchaseBundleDto } from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('bundles')
  @ApiOperation({ summary: 'List all active credit bundles' })
  async getBundles() {
    return this.paymentsService.getBundles();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @Post('purchase')
  @ApiOperation({ summary: 'Purchase a credit bundle (initializes Paystack payment)' })
  async purchase(@Req() req: any, @Body() dto: PurchaseBundleDto) {
    return this.paymentsService.purchaseBundle(req.user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify a payment by reference (after Paystack callback)' })
  async verify(@Param('reference') reference: string, @Req() req: any) {
    return this.paymentsService.verifyTransaction(reference, req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, description: 'purchase, deduction, or refund' })
  async getHistory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.paymentsService.getHistory(req.user.sub, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @ApiOperation({ summary: 'Get payment statistics for the current user' })
  async getStats(@Req() req: any) {
    return this.paymentsService.getStats(req.user.sub, req.user.role);
  }

  // Paystack webhook — public, uses signature verification
  @Post('webhook')
  @ApiOperation({ summary: 'Paystack webhook (signature verified)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }
}
