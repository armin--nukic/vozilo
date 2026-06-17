import {Body, Controller, HttpException, HttpStatus, Post} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ApiTags} from '@nestjs/swagger';
import {IsIn, IsOptional, IsString} from 'class-validator';
import Stripe from 'stripe';

class CheckoutDto {
  @IsIn(['premium', 'business'])
  plan!: 'premium' | 'business';

  @IsOptional()
  @IsString()
  customerEmail?: string;
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly config: ConfigService) {}

  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    const frontendOrigin = this.config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:3333';
    const priceId =
      dto.plan === 'premium'
        ? this.config.get<string>('STRIPE_PREMIUM_PRICE_ID')
        : this.config.get<string>('STRIPE_BUSINESS_PRICE_ID');

    if (!secretKey || !priceId) {
      return {
        configured: false,
        message: 'Stripe is not configured yet. Set STRIPE_SECRET_KEY and the plan price id.',
        plan: dto.plan,
        expectedEnv:
          dto.plan === 'premium'
            ? ['STRIPE_SECRET_KEY', 'STRIPE_PREMIUM_PRICE_ID']
            : ['STRIPE_SECRET_KEY', 'STRIPE_BUSINESS_PRICE_ID']
      };
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-05-27.dahlia'
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: dto.customerEmail,
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        success_url: `${frontendOrigin}/bs?checkout=success`,
        cancel_url: `${frontendOrigin}/bs?checkout=cancelled`,
        metadata: {
          plan: dto.plan,
          product: 'vozilo.ba'
        }
      });

      return {
        configured: true,
        url: session.url
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Stripe checkout failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
