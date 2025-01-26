import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between } from 'typeorm';
import { CreatePaymentDto } from './dto';
import { PaymentRepository, PaymentEntity } from '../../core';
import { BaseService } from '../../infrastructure';
import { PaymentType } from '../../common';

@Injectable()
export class PaymentService extends BaseService<
  CreatePaymentDto,
  PaymentEntity
> {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: PaymentRepository,
  ) {
    super(paymentRepository);
  }

  async findPaymentsByType(type: PaymentType) {
    const data = await this.paymentRepository.find({
      where: { type },
      relations: ['debt'],
    });
    return {
      status_code: 200,
      message: 'success',
      data,
    };
  }

  async findAllPayment(page: number, limit: number) {
    page = (page - 1) * limit;
    return this.findAll({ skip: page, take: limit, relations: ['debt'] });
  }

  async findPaymentsByDebtId(debtId: string) {
    const data = await this.paymentRepository.find({
      where: { debt_id: debtId },
      relations: ['debt'],
    });
    if (!data) {
      throw new NotFoundException(`Debtid with id ${debtId} not found.`);
    }
    return {
      status_code: 200,
      message: 'success',
      data,
    };
  }

  async findPaymentsBetweenDates(startDate: string, endDate: string) {
    const data = await this.paymentRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['debt'],
    });

    return {
      status_code: 200,
      message: 'success',
      data,
    };
  }

  async deletePaymentsByDebtId(debtId: string) {
    const result = await this.paymentRepository.delete({ debt_id: debtId });
    if (!result) {
      throw new NotFoundException(`Debtid with id ${debtId} not found.`);
    }
    return {
      status_code: 200,
      message: 'success',
      deleted_count: result.affected,
    };
  }

  async updatePaymentType(id: string, newType: PaymentType) {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      return {
        status_code: 404,
        message: 'Payment not found',
      };
    }

    payment.type = newType;
    await this.paymentRepository.save(payment);

    return {
      status_code: 200,
      message: 'success',
      data: payment,
    };
  }
}
