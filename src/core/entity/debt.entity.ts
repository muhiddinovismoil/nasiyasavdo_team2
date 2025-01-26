import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity, DebtPeriod } from '../../common/index';
import { DebtImageEntity, DebtorEntity, PaymentEntity } from './';

@Entity('debts')
export class DebtEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  debtor_id: string;

  @Column({ type: 'timestamp' })
  debt_date: Date;

  @Column({ type: 'enum', enum: DebtPeriod })
  debt_period: DebtPeriod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  debt_sum: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => PaymentEntity, (payment) => payment.debt, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  payments: PaymentEntity[];

  @ManyToOne(() => DebtorEntity, (debtor) => debtor.debts)
  @JoinColumn({ name: 'debtor_id' })
  debtor: DebtorEntity;

  @OneToMany(() => DebtImageEntity, (image) => image.debt, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  images: DebtImageEntity[];
}
